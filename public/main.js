/* global Trello */
"use strict"

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

let currentUser = null;

const MainVM = JS.class('MainVM', {
	mixin : ObservableClass,

	fields : {
		cards : {
			type       : Array,
			observable : true
		},

		lastActionDate : {
			type : Date,
			init : null
		},

		theme : {
			type       : 'classic',
			observable : true
		}
	},

	constructor : function() {
		setInterval(() => this.getCards(), 30 * 1000);

		// look for the theme in the URL
		let params = new URLSearchParams(window.location.search.substring(1));
		this.theme = params.get('theme') || localStorage.get('theme') || 'classic';

		ko.computed(() => {
			let newActions = _(this.cards).map(card => card.newActionsCount()).sum().valueOf();
			document.title = `(${newActions}) Demux`;
		});
	},

	methods : {
		getCards : function() {
			let newCards = [];

			Trello.get('/boards/31p5PlZu/actions', { limit : 200, since : this.lastActionDate, filter : cardActions.join(',') }, results => {
				_(results).groupBy(result => result.data.card.id).forOwn((actions, cardID) => {
					let card = _.find(this.cards, { id : cardID }) || new Card(cardID);

					newCards.push(card);

					card.name = actions[0].data.card.name || card.name;

					card.addActions(_.compact(actions.map(action => {
						let updateText = 'updated card';

						switch (action.type) {
							case "addChecklistToCard":
							case "removeChecklistFromCard":
								updateText = action.data.checklist.name;
								break;
							case "addMemberToCard":
							case "removeMemberFromCard":
								updateText = action.member.fullName.split(' ')[0];
								break;
							case "updateCard":
								if (action.data.old.name !== undefined)
									updateText = "updated NAME";
								else if (action.data.old.desc !== undefined)
									updateText = "updated DESCRIPTION";
								else if (action.data.listAfter)
									updateText = '⇨ ' + action.data.listAfter.name;
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
							update     : updateText
						};
					})));
				});

				// add to the front of the cards array
				this.cards = newCards.concat(_.without(this.cards, ...newCards));
			});
		},

		dismiss : function(cardID) {
			let card = _.find(this.cards, { id : cardID });
			if (card) card.dismiss();
		}
	}
});

const Card = JS.class('Card', {
	mixin : ObservableClass,

	fields : {
		id : null,

		name : {
			type       : '',
			observable : true
		},

		lastSeenDate : {
			type       : String,
			observable : true
		},

		actions : {
			type       : Array,
			observable : true
		},

		isVisible : {
			observable : true,
			get : function() {
				return this.actions.length > 0 && (!this.lastSeenDate || this.actions[0].when.isAfter(this.lastSeenDate));
			}
		}
	},

	constructor : function(cardID) {
		this.id = cardID;
		this.lastSeenDate = localStorage.get('card-' + this.id) || '';
	},

	methods : {
		addActions : function(actions) {
			this.actions = _(actions.concat(this.actions)).mapKeys('id').values().value();
		},

		dismiss : function() {
			this.lastSeenDate = this.actions[0].origAction.date;
			localStorage.set('card-' + this.id, this.lastSeenDate);
		},

		newActionsCount : function() {
			if (!this.lastSeenDate) return this.actions.length;
			return this.actions.filter(action => action.when.isAfter(this.lastSeenDate)).length;
		},

		formatComment : function(comment) {
			return comment.replace(/(?:^|\s+)@([^\s]+)/g, '<b> $1</b>');
		}
	}
});

let mainVM = module.exports = new MainVM();

// check for authorization
Trello.authorize({
	type  : 'redirect',
	name  : 'Roadmunk Trello Notifications',
	scope : {
		read  : true,
		write : true
	},
	expiration : '30days',
	success    : () => {
		Trello.get('/members/me').then(user => currentUser = user);
		mainVM.getCards()
	},
	error      : () => { console.error('not authorized') }
});

});