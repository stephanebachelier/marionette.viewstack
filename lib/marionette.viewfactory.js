/* jshint strict:false */
var ViewFactory = function (views) {
  this._views = views;
};

ViewFactory.prototype = {
  create: function (name, options) { // jshint unused:false
    var factory = this._views[name];
    if (!factory) {
      console.warn('Cannot find [' + name + '] view');
      return null;
    }

    return factory.create(options);
  }
};

ViewFactory.extend = Marionette.extend;

Marionette.viewStack.ViewFactory = ViewFactory;
