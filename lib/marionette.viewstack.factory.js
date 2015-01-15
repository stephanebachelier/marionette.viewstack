/* jshint strict:false */
var ViewStackFactory = ViewFactory.extend({ // jshint unused:false
  constructor: function (views, options) {
    this._views = views;
    this.options = options || {};

    this._stack = this.options.viewStack || this.getViewStack();
    this._cache = this.options.cache || this.getViewCache();
  },

  getViewStack: function () {
    // to be implemented if viewStack is not passed in arguments
  },

  getViewCache: function () {
    return new ViewCache();
  },

  getViewStackOptions: function (name, view, viewStackOptions) {
    return viewStackOptions;
  },

  pop: function (view) {
    this._stack.pop(view);
  },

  popUntil: function (name) {
    var view = this.viewCache.get(name);

    if (view) {
      this._stack.popUntil(view);
    }
  },

  push: function (name, options, viewStackOptions) {
    // TODO fix this naive implementation which ignore options
    // but the purpose of this function is simply to avoid adding the same view on top
    // of the stack so this implementation should suffice
    var view = this.viewCache.get(name);

    // swap existing view
    if (view) {
      this._stack.swap(view, viewStackOptions || {});
      return view;
    }

    // if view not in cache build and push on stack
    view = this.create(name, options);

    // add view to cache with smart flag which means that view cache should listen to
    // view destroy event to clean up its cache
    this.viewCache.push(name, view, {smart: true});

    // enable override of the view stack options based on the view created
    var vsOptions = _.isFunction(this.getViewStackOptions) ?
      this.getViewStackOptions(name, view, viewStackOptions) : viewStackOptions;

    // enable override of the view container or use the default one
    var wrapper = _.isFunction(this.getViewWrapper) ?
      this.getViewWrapper(view, options, vsOptions) : undefined;

    // push view on top of view stack
    this._stack.pushIn(wrapper, view, vsOptions || {});

    return view;
  }
});

ViewStackFactory.extend = Marionette.extend;

Marionette.viewStack.ViewStackFactory = ViewStackFactory;
