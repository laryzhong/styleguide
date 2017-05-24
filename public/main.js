/* global Trello */
'use strict'

define(function(require, exports, module) {

	const JS              = require('JS');
	const _               = require('lodash');
	const ko              = require('knockout');
	const Moment          = require('moment');
	const ObservableClass = require('lib/ObservableClass');
	const localStorage    = require('lib/localStorageCache').config({ namespace : 'trello' });
	require('lib/vendor/Trello');
	require('lib/extraBindings');

	const cardActions = [
		'addAttachmentToCard',
		'addChecklistToCard',
		'addMemberToCard',
		'commentCard',
		'deleteCard',
		'moveCardToBoard',
		'removeChecklistFromCard',
		'removeMemberFromCard',
		'updateCard'
	];

	let currentUser     = null;
	let allUsers        = [];
	const RoadmunkOrgID = '529fc58fd28aff0b2b000e25';

	const MainVM = JS.class('MainVM', {
		mixin : ObservableClass,

		fields : {
			cards : {
				type       : Array,
				observable : true,
			},

			lastActionDate : {
				type : Date,
				init : null,
			},

			theme : {
				type       : 'classic',
				observable : true,
			},

			boardIDs : {
				type : Array
			},

			currentTime : {
				type       : Moment,
				observable : true,
			},
		},

		constructor : function() {
			setInterval(() => this.getCards(), 30 * 1000);

			setInterval(() => { this.currentTime = new Moment() }, 10000);

			// look for the theme in the URL
			const params = new URLSearchParams(window.location.search.substring(1));
			this.theme = params.get('theme') || localStorage.get('theme') || 'classic';
			localStorage.set('theme', this.theme);

			// get board IDs
			this.boardIDs = new URLSearchParams(window.location.search).getAll('boardID');
			if (this.boardIDs.length === 0) this.boardIDs = localStorage.get('boardIDs') || [];
			if (this.boardIDs.length === 0) this.boardIDs = [ '31p5PlZu' ]; // defaults to Dev board
			localStorage.set('boardIDs', this.boardIDs);

			ko.computed(() => {
				const newActions = _(this.cards).map(card => card.newActionsCount()).sum().valueOf();
				document.title = `(${newActions}) Demux`;
			});
		},

		methods : {
			getCards : function() {
				const newCards = [];

				this.boardIDs.forEach(boardID => {
					Trello.get(`/boards/${boardID}/actions`, { limit : 200, since : this.lastActionDate, filter : cardActions.join(',') }, results => {
						_(results).groupBy(result => result.data.card.id).forOwn((actions, cardID) => {
							const card = _.find(this.cards, { id : cardID }) || new Card(cardID);

							newCards.push(card);

							card.name = actions[0].data.card.name || card.name;

							card.addActions(_.compact(actions.map(action => {
								let updateText = 'updated card';
								let icon = '';

								switch (action.type) {
									case 'addChecklistToCard':
									case 'removeChecklistFromCard':
										updateText = action.data.checklist.name;
										break;
									case 'addMemberToCard':
									case 'removeMemberFromCard':
										updateText = action.member.fullName.split(' ')[0];
										break;
									case 'updateCard':
										if (action.data.old.name !== undefined)
											updateText = 'updated NAME';
										else if (action.data.old.desc !== undefined)
											updateText = 'updated DESCRIPTION';
										else if (action.data.listAfter) {
											icon = '&#xf18e;'
											updateText = ` ${action.data.listAfter.name}`;
										}
										else if (action.data.old.closed !== undefined)
											updateText = action.data.card.closed ? 'ARCHIVED' : 'UNARCHIVED';
										else if (action.data.old.pos !== undefined)
											return;	// don't care about these updates
										break;
								}

								if (!this.lastActionDate || this.lastActionDate < action.date)
									this.lastActionDate = action.date;

								return {
									id         : action.id,
									type       : action.type,
									who        : action.memberCreator.fullName.split(' ')[0],
									when       : new Moment(action.date),
									origAction : action,
									comment    : action.data.text,
									icon       : icon,
									update     : updateText,
								};
							})));
						});

						// add to the front of the cards array
						this.cards = _.sortBy(newCards.concat(_.without(this.cards, ...newCards)), card => _.maxBy(card.actions, action => action.when.valueOf()));
					});
				});
			},

			dismiss : function(cardID) {
				const card = _.find(this.cards, { id : cardID });
				if (card) card.dismiss();
			},

			fromNow : function(moment) {
				return moment.from(this.currentTime);
			},
		},
	});

	const Card = JS.class('Card', {
		mixin : ObservableClass,

		fields : {
			id : null,

			name : {
				type       : '',
				observable : true,
			},

			lastSeenDate : {
				type       : String,
				observable : true,
			},

			actions : {
				type       : Array,
				observable : true,
			},

			isVisible : {
				observable : true,
				get        : function() {
					return this.actions.length > 0 && (!this.lastSeenDate || this.actions[0].when.isAfter(this.lastSeenDate));
				},
			},
		},

		constructor : function(cardID) {
			this.id = cardID;
			this.lastSeenDate = localStorage.get(`card-${this.id}`) || '';
		},

		methods : {
			addActions : function(actions) {
				this.actions = _(actions.concat(this.actions)).mapKeys('id').values().value();
			},

			dismiss : function() {
				this.lastSeenDate = this.actions[0].origAction.date;
				localStorage.set(`card-${this.id}`, this.lastSeenDate);
			},

			newActionsCount : function() {
				if (!this.lastSeenDate) return this.actions.length;
				return this.actions.filter(action => action.when.isAfter(this.lastSeenDate)).length;
			},

			formatComment : function(comment) {
				// replaces @ usernames
				return escapeHtml(comment)
					.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
						return `<a href="${url}" target="_blank">${url}</a>`;
					})
					.replace(/(?:^|\s+)@([^\s,\.:;]+)/g, (match, username) => {
						const userClass = username === currentUser.username ? 'current' : '';
						const firstName = (allUsers.find(user => user.username === username) || {}).firstName || username;
						return `<span class="user ${userClass}"> ${firstName}</span>`;
					})
				;
			},
		},
	});

	const mainVM = module.exports = new MainVM();

	// check for authorization
	Trello.authorize({
		type  : 'redirect',
		name  : 'Roadmunk Trello Notifications',
		scope : {
			read  : true,
			write : true,
		},
		expiration : '30days',
		success    : () => {
			Promise.all([
				Trello.get('/members/me').then(user => { currentUser = user }),
				Trello.get(`/organizations/${RoadmunkOrgID}/members`).then(members => {
					allUsers = members;
					allUsers.forEach(user => user.firstName = user.fullName ? user.fullName.split(' ')[0] : '')
				})
			]).then(() => mainVM.getCards());
		},
		error : () => { console.error('not authorized') },
	});

	function escapeHtml(str) {
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}

});
