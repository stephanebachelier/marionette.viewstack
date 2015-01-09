/* jshint strict:false */
/* global Container */
/* global ViewController */
var ViewStack = function (options) {
  this.options = options;

  this.viewController = this.options.controller || new ViewController({
    el: options.el
  });

  this.container = this.options.container || new Container();
};

ViewStack.prototype = {
  push: function (view, options) {
    return this.pushIn(null, view, options);
  },

  pushIn: function (region, view, options) {
    // delegate view injection into DOM to view controller
    this.container.add(view.cid, this.viewController.showIn(region, view, options));

    return view;
  },

  pop: function (view) {
    var _view = view ? this.container.get(view.cid) : this.container.last();
    // delegate view removal from DOM to view controller
    // view container removal is deferred until view:removed event is received.
    return this.viewController.remove(_view);
  },

  popAll: function (view, options) {
    if (!view) {
      this.pop();
    }

    options = options || {};

    // destroy views from topmost to the given view
    var views = this.container.invertedRange(view.cid, this.container.last(), options);
    return this.viewController.removeViews(views);
  },

  popUntil: function (view) {
    if (!view) {
      return;
    }

    // destroy views from topmost to the one top of the given view
    return this.popAll(view, {excludeStart: true});
  },

  swap: function (view, options) {
    return this.viewController.swap(view, options);
  }
};

ViewStack.extend = Marionette.extend;

ViewStack = ViewStack.extend(Backbone.Events);

Marionette.ViewStack = ViewStack;
