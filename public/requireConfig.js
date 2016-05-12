require.config({
	waitSeconds : 10,

	paths : {
		"knockout"              : "lib/vendor/knockout",
		"jquery"                : "lib/vendor/bower_components/jquery/dist/jquery",
		"css"                   : "lib/vendor/bower_components/require-css/css",
		"text"                  : "lib/vendor/bower_components/requirejs-text/text",
		"moment"                : "lib/vendor/bower_components/moment/moment",
		"extraBindings"         : "lib/extraBindings",
		"trello"                : "https://api.trello.com/1/client.js?key=8eaaa12831af734bbe969ac953e7650b"
	},
	map : {
		'*' : {
			// common libs are done here because if they're in 'paths' property it can create multiple URLs on the client
			"JS"        : "lib/vendor/JS",
			"lodash"    : "lib/vendor/lodash",
			"chai"      : "lib/vendor/chai",
			"tinycolor" : "lib/vendor/tinycolor",
			"string"    : "lib/vendor/string",
			"chance"    : "lib/vendor/chance"
		}
	},
	shim: {
		'knockout'  : [ 'jquery'],
		'trello'    : {
			deps    : [ 'jquery' ],
			exports : 'Trello'
		}
	},
	config : {
		text: {
			// https://github.com/requirejs/text#xhr-restrictions
			useXhr: function () { return true }
		}
	}
});
