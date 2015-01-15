/* jshint strict:false */
var ViewFactory = function (views) {
  this._views = views;
};

ViewFactory.prototype = {
  getViewFactory: function (name) {
    var factory = this._views[name];
    if (!factory) {
      throw new Error('Cannot find [' + name + '] view factory.');
    }

    return factory;
  },

  create: function (name, options) { // jshint unused:false
    return this.getViewFactory(name).create(options);
  }
};

ViewFactory.extend = Marionette.extend;

Marionette.viewStack.ViewFactory = ViewFactory;
