/* jshint strict:false */
var ViewFactory = Object.create(null);

ViewFactory = {
  create: function (name, options) { // jshint unused:false
    // do something
  }
};

ViewFactory.extend = Marionette.extend;

Marionette.viewStack.ViewFactory = ViewFactory;
