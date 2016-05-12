/**
 * This mixin class can be added as a mixin to any client-side class that has observable fields.
 * Any such fields (markted with observabe : true) will have an underlying observable field created
 * (with field name same as the original field but prepended with an underscore).
 * The original field redirects to observable using getter/setters so that it's easy to access.
 */
define(function(require, exports, module) {

var JS = require('JS');
var ko = require('knockout');
var _  = require('lodash');

var ObservableClass = module.exports = JS.class('ObservableClass', {
	methods : {
		getObservableForField : function(fieldName) {
			return this['_' + fieldName];
		}
	}
});

JS.class.on('fieldDefinition', function(clazz, fieldName, fieldProperties) {
	if (!fieldProperties.observable || !clazz.hasMixin || !clazz.hasMixin(ObservableClass))
		return;

	var properties = clazz.properties;

	// assert: mixin includes ObservableClass

	var observableField = '_' + fieldName;
	if (properties.fields[observableField]) return;	// field was already processed (probably by a parent class)
	var oldInitValue    = fieldProperties.init;
	var getter          = fieldProperties.get;
	var setter          = fieldProperties.set;

	// create a clone of the properties since we're modifying and the field could be a mixin of several classes
	fieldProperties = properties.fields[fieldName] = _.cloneDeep(fieldProperties);

	// the actual ko.observable field
	properties.fields[observableField] = {
		type : null,
		init : function() {
			var result;
			var initValue = typeof oldInitValue == 'function' ? oldInitValue.call(this) : oldInitValue;

			if (typeof getter == "function" || typeof setter == "function") {
				result = ko.computed({
					read  : getter,
					write : setter,
					owner : this,
					pure            : fieldProperties.observable === 'pure'  || !!fieldProperties.observable.pure,
					deferEvaluation : fieldProperties.observable === 'defer' || !!fieldProperties.observable.deferEvaluation
				});
			}
			else if (fieldProperties.type == Array) {
				result = ko.observableArray();
				if (initValue === undefined) initValue = [];
			}
			else
				result = ko.observable();

			this[observableField] = result;
			if (initValue !== undefined && ko.isWriteableObservable(this[observableField]))
				this[observableField](initValue);

			this[observableField]._fieldName = this.constructor.__className__ + '.' + fieldName;

			return result;
		}
	};

	// original field simply redirects to observable field
	fieldProperties.get = JS.getter(observableField, { asFunction : true });

	// setter exists or neither setter or getter exist (regular observable)
	if (setter || !getter)
		fieldProperties.set = JS.setter(observableField, { asFunction : true });

	// make sure the observable gets initialized first so that this field's setter will work properly
	fieldProperties.initDependencies = JS.util.ensureArray(fieldProperties.initDependencies);
	fieldProperties.initDependencies.push(observableField);
});


}); // end of module