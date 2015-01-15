/* jshint strict:false */
var ViewStackFactory = function (views, options) { // jshint unused:false
  this._views = views;
  this.options = options || {};

  this._stack = this.options.viewStack || this.getViewStack();
  this._cache = this.options.cache || this.getViewCache();
};

ViewStackFactory.prototype = {
  getViewFactory: function (name) {
    var factory = this._views[name];
    if (!factory) {
      throw new Error('Cannot find [' + name + '] view factory.');
    }

    return factory;
  },

  getViewStack: function () {
    // to be implemented if viewStack is not passed in arguments
  },

  getViewCache: function () {
    return new ViewCache();
  },

  // retrieve the cache unique identifier using name and options
  // this enable a better caching strategy not only based on name
  // as multiple views can be registered under the same name.
  //
  // Use a combination of name and options to build a caching strategy
  //
  // by default use only the name
  getCacheUid: function (name, options) { // jshint unused:false
    return name;
  },

  pop: function (view) {
    this._stack.pop(view);
  },

  popUntil: function (name) {
    var view = this._cache.get(name);

    if (view) {
      this._stack.popUntil(view);
    }
  },

  push: function (name, options, viewStackOptions) {
    var factory = this.getViewFactory(name);

    // retrieve a cache uid
    var cacheUid = (factory.getCacheUid || this.getCacheUid)(name, options);
    var view = this._cache.get(cacheUid);

    // swap existing view
    if (view) {
      this._stack.swap(view, viewStackOptions || {});
      return view;
    }

    // if view not in cache build and push on stack
    view = factory.create(options);

    // add view to cache with smart flag which means that view cache should listen to
    // view destroy event to clean up its cache
    this._cache.push(cacheUid, view, {smart: true});

    // enable override of the view stack options based on the view created
    var getViewStackOptions = (factory.getViewStackOptions || this.getViewStackOptions);
    var vsOptions = _.isFunction(getViewStackOptions) ?
      getViewStackOptions(name, view, viewStackOptions) : viewStackOptions;

    // enable override of the view container or use the default one
    var getViewWrapper =  (factory.getViewWrapper || this.getViewWrapper);
    var wrapper = _.isFunction(getViewWrapper) ?
      getViewWrapper(view, options, vsOptions) : undefined;

    // push view on top of view stack
    this._stack.pushIn(wrapper, view, vsOptions || {});

    return view;
  }
};

ViewStackFactory.extend = Marionette.extend;

Marionette.viewStack.ViewStackFactory = ViewStackFactory;
