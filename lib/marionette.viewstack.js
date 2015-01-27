var ViewStack = function (options) {
  this.options = options || {};

  this.viewController = this.options.controller || this.getDefaultViewController(options);

  this.container = this.options.container || this.getDefaultContainer();
};

ViewStack.prototype = {
  getDefaultViewController: function (options) {
    return new ViewController({el: options.el});
  },

  getDefaultContainer: function () {
    return new Hashmapper();
  },

  push: function (view, options) {
    return this.pushIn(null, view, options);
  },

  pushIn: function (region, view, options) {
    view.once('destroy', function () {
      this.container.remove(view.cid);
    }, this);
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
    var wrapper = this.container.get(view.cid);
    return this.viewController.swap(wrapper, options);
  },

  // sugar : proxy container length() to ease some logic
  length: function () {
    return this.container.length();
  },

  // sugar around container.length method
  isEmpty: function () {
    return 0 <= this.length();
  }
};

ViewStack.extend = Marionette.extend;

ViewStack = ViewStack.extend(Backbone.Events);

Marionette.viewStack.ViewStack = ViewStack;
