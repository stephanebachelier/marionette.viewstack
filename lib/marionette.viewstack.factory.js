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

  getView: function (factory, name, options) {
    // retrieve a cache uid
    var cacheUid = (factory.getCacheUid || this.getCacheUid)(name, options);
    var view = this._cache.get(cacheUid);

    if (view) {
      return view;
    }

    // if view not in cache build and push on stack
    view = factory.create(options);

    // add view to cache with smart flag which means that view cache should listen to
    // view destroy event to clean up its cache
    this._cache.push(cacheUid, view, {smart: true});

    return view;
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

    var view = this.getView(factory, name, options);

    // swap view if already in view stack
    if (this._stack.contains(view)) {
      this._stack.swap(view, viewStackOptions || {});
    }

    // enable override of the view stack options based on the view created
    var vsOptionsHandler;

    if (factory.getViewStackOptions && _.isFunction(factory.getViewStackOptions)) {
      vsOptionsHandler = {
        ctx: factory,
        func: factory.getViewStackOptions
      };
    }
    else {
      if (this.getViewStackOptions && _.isFunction(this.getViewStackOptions)) {
        vsOptionsHandler = {
          ctx: this,
          func: this.getViewStackOptions
        };
      }
    }

    var vsOptions = vsOptionsHandler ?
      vsOptionsHandler.func.call(vsOptionsHandler.ctx, name, view, viewStackOptions) : viewStackOptions;

    var viewWrapperHandler;

    if (factory.getViewWrapper && _.isFunction(factory.getViewWrapper)) {
      viewWrapperHandler = {
        ctx: factory,
        func: factory.getViewWrapper
      };
    }
    else {
      if (this.getViewWrapper && _.isFunction(this.getViewWrapper)) {
        viewWrapperHandler = {
          ctx: this,
          func: this.getViewWrapper
        };
      }
    }

    // enable override of the view container or use the default one
    var wrapper = viewWrapperHandler ?
      viewWrapperHandler.func.call(viewWrapperHandler.ctx, view, options, vsOptions) : undefined;

    // push view on top of view stack
    this._stack.pushIn(wrapper, view, vsOptions || {});

    return view;
  }
};

ViewStackFactory.extend = Marionette.extend;

Marionette.viewStack.ViewStackFactory = ViewStackFactory;
