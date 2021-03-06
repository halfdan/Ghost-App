'use strict';

var _ = require('underscore'),
    helpers = require('./helpers'),
    App;

/**
 * App is the base class for a standard Ghost App.  Includes empty handlers for life cycle events.
 * @class
 * @parameter {Ghost} The current Ghost app instance
 */
App = function (ghost) {
    this.app = ghost;

    this.initialize();
};

/**
 * A mapping of filter names to method names
 */
App.prototype.filters = {};

/**
 * A method that is run after the constructor and allows for special logic
 */
App.prototype.initialize = function () {
    return;
};

/**
 * A method that will be called on installation.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
App.prototype.install = function () {
    return;
};

/**
 * A method that will be called on uninstallation.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
App.prototype.uninstall = function () {
    return;
};

/**
 * A method that will be called when the App is enabled.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
App.prototype.activate = function () {
    this.registerFilters();
};

/**
 * A method that will be called when the App is disabled.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
App.prototype.deactivate = function () {
    this.unregisterFilters();
};

/**
 * Register Ghost filters based on a passed in mapping object
 * @parameter {Object} A mapping of filter names to methods names on the app instance.
 */
App.prototype.registerFilters = function (filters) {
    var self = this;
    this._eachFilter(filters, function (filterName, filterHandlerArgs) {
        var parms = [filterName].concat(filterHandlerArgs);

        self.app.filters.register.apply(self.app.filters, parms);
    });
};

/**
 * Unregister Ghost filters based on a passed in mapping object
 * @parameter {Object} A mapping of filter names to methods names on the app instance.
 */
App.prototype.unregisterFilters = function (filters) {
    var self = this;

    this._eachFilter(filters, function (filterName, filterHandlerArgs) {
        var parms = [filterName].concat(filterHandlerArgs);

        self.app.filters.unregister.apply(self.app.filters, parms);
    });
};

/**
 * Iterate through each passed in filter (or this.filters if nothing passed)
 * and normalize the arguments that should be passed to *registerFilter methods
 * @parameter {Object} optional mapping of filter names to methods names on the app instance.
 * @parameter {Function} the callback to run for each filter key value mapping.
 */
App.prototype._eachFilter = function (filters, filterDataHandler) {
    filters = filters || this.filters;

    // Allow passing a function as the filters
    if (_.isFunction(filters)) {
        filters = filters();
    }

    var self = this;

    _.each(filters, function (filterHandlerArgs, filterName) {
        // Iterate through and determine if there is a priority or not
        if (_.isArray(filterHandlerArgs)) {
            // Account for some idiot only passing one value in the array.
            if (filterHandlerArgs.length === 1) {
                filterHandlerArgs.splice(0, 0, null);
            }

            filterHandlerArgs[1] = self[filterHandlerArgs[1]];
        } else {
            filterHandlerArgs = [self[filterHandlerArgs]];
        }

        filterDataHandler(filterName, filterHandlerArgs);
    });
};

// Offer an easy to use extend method.
App.extend = helpers.extend;

module.exports = App;