/**
 * Stores objects in browser's localStorage, and prunes old ones as needed when reaching the storage limit imposed by the browser.
 */
define(function(require, exports, module) {

var JS = require('JS');

// legacy key prefixes -- used to identify purge candidates
const LEGACY_PREFIXES = ['RoadmapData', 'screenshot', 'roadmunk-RoadmapData'];

// a cache of storageDates for each full key
var metaDataCache = {};

// COULDDO: add support for using sessionStorage as additional space

const LocalStorageCache = JS.class('LocalStorageCache', {

	fields : {
		// prefix all of the keys controlled by this class
		// some items for the site are not controlled by this class (ie mongoMachineId used by ObjectID)
		namespace : '',
	},

	constructor : function(namespace) {
		if (namespace) this.namespace = namespace;
	},

	methods : {
		_getPrefixedKey : function(key) {
			return this.namespace ? this.namespace + '.' + key : key;
		},

		getMetaData : function(key) {
			var fullKey = this._getPrefixedKey(key);

			if (!metaDataCache.hasOwnProperty(fullKey))
				metaDataCache[fullKey] = this.get(key, { metaData : true });

			var metaData = metaDataCache[fullKey];
			var expired  = metaData && metaData.expires && metaData.expires < new Date();
			var isActual = localStorage.hasOwnProperty(fullKey);
			if (expired || !isActual) {
				this.delete(key, { returnValue : false });
				metaData = undefined;
			}

			return metaData;
		},

		/**
		 * Retrieves an item from browser's local storage
		 * @param  {String} key Globally unique identifier for object
		 * @param  {Object} [options]
		 *            {Boolean} [metaData=false] if true, returns the metaData for the key
		 * @return {*}      value stored at key, or undefined if not found
		 */
		get : function(key, options) {
			var record = localStorage.getItem(this._getPrefixedKey(key));

			if (record === null)
				return undefined;

			record = tryParseRecord(record);

			if (typeof record != 'object' || record == null)
				return record;

			// check for expiry
			if (record.expires && typeof record.expires == 'number' && record.expires <= new Date()) {
				this.delete(key, { returnValue : false });
				return undefined;
			}

			if (options && options.metaData) {
				return {
					timestamp : record.timestamp ? new Date(record.timestamp) : undefined,
					expires   : record.expires   ? new Date(record.expires) : undefined
				};
			}

			return record.value;
		},

		/**
		 * Stores an item in the browser's local storage.
		 * Prunes items if required to stay under storage limit imposed by browser.
		 * Oldest item by storage date gets pruned first.
		 *
		 * @param  {String} key    Globally unique identifier for object
		 * @param  {*}      value  Item to store.  Must be serializable by JSON.stringify (primitives are serializable).
		 * @param  {Object} [options]
		 *            {Date} expires if set, specifies when the item is no longer valid and should be removed from localStorage
		 * @return {Boolean}       Whether storing the item was successful
		 */
		set : function(key, value, options) {
			options = JS.util.defaults(options, { expires : undefined });

			var timestamp = new Date();

			var record = JSON.stringify({
				value     : value,
				timestamp : timestamp.valueOf(),
				expires   : options.expires ? options.expires.valueOf() : undefined
			});

			// don't attempt to store anything bigger than 5MB since we'd be needlessly purging the cache
			if (record.length > 5*1024*1024)
				return false;

			var purgeCandidates;
			while (true) {
				try {
					var fullKey = this._getPrefixedKey(key);
					localStorage.setItem(fullKey, record);
					metaDataCache[fullKey] = {
						timestamp : timestamp,
						expires   : options.expires ? new Date(options.expires) : undefined
					};

					return true;
				}
				catch (err) {
					if (err.name !== 'QuotaExceededError' && err.name !== 'NS_ERROR_DOM_QUOTA_REACHED')
						return false;

					// if we haven't yet built the list of candidates for purging, build that list now
					if (!purgeCandidates) {

						var purgeKeyPrefixes = LEGACY_PREFIXES.concat(this._getPrefixedKey(''));
						purgeCandidates = getKeysWithPrefixes(purgeKeyPrefixes, true).map(function(purgeItemKey) {
							var purgeItem = tryParseRecord(localStorage.getItem(purgeItemKey));

							// if it doesn't have a timestamp, then purge it first
							return {
								key       : purgeItemKey,
								timestamp : typeof purgeItem.timestamp == 'number' ? purgeItem.timestamp : Number.MIN_VALUE
							};
						});

						// sort in descending timestamp order (so that last item in array is oldest and therefore the first to be purged)
						purgeCandidates.sort(function(a, b) { return b.timestamp - a.timestamp; });
					}

					// if the list of purge candidates is still empty, then there's nothing we can do to make extra space
					if (purgeCandidates.length === 0)
						return false;

					var fullKey = purgeCandidates.pop().key;
					localStorage.removeItem(fullKey);
					delete metaDataCache[fullKey];
				}
			}
		},

		/**
		 * Removes an item from the browser's local storage, if it exists.
		 * @param  {String} key
		 * @param {Object} options
		 *           {Boolean} [returnValue=true] if true, returns the deleted value, if false returns undefined
		 */
		delete : function(key, options) {
			options = JS.util.defaults(options, { returnValue : true });

			var value   = options.returnValue ? this.get(key) : undefined;
			var fullKey = this._getPrefixedKey(key);
			localStorage.removeItem(fullKey);
			delete metaDataCache[fullKey];

			return value;
		},

		clear : function() {
			getKeysWithPrefixes([ this._getPrefixedKey('') ], true).forEach(function(key) {
				localStorage.removeItem(key);
				delete metaDataCache[key];
			});
		},

		has : function(key) {
			return !!this.getMetaData(key);
		},

		/**
		 * Returns all keys in the browser's local storage that are managed by this class.
		 */
		keys : function() {
			var self = this;
			return getKeysWithPrefixes([ this._getPrefixedKey('') ]).filter(function(key) {
				return self.has(key);	// checks for expiry
			});
		},

		/**
		 * Calls the given callback once for each key/value in this storage.
		 * @param  {Function} callback
		 *             {*}      value
		 *             {String} key
		 */
		forEach : function(callback) {
			var self = this;

			this.keys().forEach(function(key) {
				callback(self.get(key), key);
			});
		},

		storageDate : function(key) {
			return (this.getMetaData(key) || {}).timestamp;
		},

		/**
		 * Returns a new instance of LocalStorageCache that has a different configuration.
		 * @param  {Object} options
		 *             {String} [namespace] a relative namespace string to this one
		 * @return {LocalStorageCache}
		 */
		config : function(options) {
			options = JS.util.defaults(options, { namespace : '' });

			var result = new LocalStorageCache(this._getPrefixedKey(options.namespace));

			return result;
		}
	}
});

module.exports = new LocalStorageCache('roadmunk');

// Private Functions

/**
 * Returns all keys in localStorage that have one of the given prefixes.
 * @param  {String[]} prefixes
 * @param  {Boolean} [withPrefix] if true, returns the keys with the prefix; if false, strips the prefix from the result keys
 */
function getKeysWithPrefixes(prefixes, withPrefix) {
	var results = [];
	for (var a = 0; a < localStorage.length; a++) {
		var key = localStorage.key(a);

		for (var b=0; b<prefixes.length; b++) {
			if (key.indexOf(prefixes[b]) === 0)
				results.push(withPrefix ? key : key.substr(prefixes[b].length));
		}
	}
	return results;
}

/**
 * Parses out a record value.
 * @param  {*} value
 * @return {*}
 */
 function tryParseRecord(value) {
	try {
		return JSON.parse(value);
	}
	catch (e) {
		return value;
	}
}

}); // end of module