(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["marionette",
      "hashmapper"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require("marionette"),
      require("hashmapper"));
  } else {
    factory(Marionette,
      hashmapper);
  }
}(this, function (Marionette, Hashmapper) {
  'use strict';
  /*! marionette.viewstack - v0.2.1
   *  Release on: 2015-01-15
   *  Copyright (c) 2015 Stéphane Bachelier
   *  Licensed MIT */
  Marionette.viewStack = {};

  /* jshint strict:false */
  var ViewController = function (options) {
    this.options = options || {};
    this._ensureElement();
  };

  ViewController.prototype = {
    _ensureElement: function () {
      this.el = document.querySelector(this.options.el);
      this.$el = Backbone.$(this.el); // $el is use for swapping
    },

    /**
    default region wrapper
    The purpose of this function is to enable the full customization of the element
    injected.
    */
    regionEl: function () {
      return document.createElement('div');
    },

    buildRegion: function (options) {
      var Region = options.regionClass || this.regionClass || Marionette.Region;
      var regionEl = options.el || this.regionEl();

      return new Region({el: regionEl});
    },

    show: function (view, options) {
      return this.showIn(null, view, options);
    },

    showIn: function (region, view, options) {
      region = region || this.buildRegion(options);

      if (!this.el.contains(region.el)) {
        this.el.appendChild(region.el);
      }

      this.triggerMethod('before:view:show', region, view, options);
      region.show(view, options);
      this.triggerMethod('view:show', region, view, options);

      return region;
    },

    remove: function (region, options) {
      if (!region) {
        throw new Error('no region found for given view.');
      }

      if (!region.currentView) {
        return;
      }

      var viewId = region.currentView.cid;
      var result = this.triggerMethod('before:view:remove', region, region.currentView);

      // read result if any and stop process if value is false
      if (false === result) {
        return;
      }

      this.triggerMethod('view:remove', region, region.currentView);

      // empty region and destroy region and its element
      var destroy = options && options.destroy;
      if (undefined === destroy || null === destroy) {
        destroy = true; // default to true
      }

      region.empty();

      if (destroy) {
        region.$el.remove();
        region.destroy();

        // inform about view removal
        this.triggerMethod('view:removed', viewId);
      }
    },

    removeViews: function (views, options) { // jshint unused:false
      var index = 0;
      var length = views.length;

      for (;index < length; index += 1) {
        this.remove(views[index]);
      }

      views = null;
    },

    swap: function (region, options) { // jshint unused:false
      if (!this.el.contains(region.el)) {
        return false;
      }

      this.$el.children().last().after(region.$el.parent());
    },

    triggerMethod: Marionette.triggerMethod
  };

  ViewController.extend = Marionette.extend;

  Marionette.viewStack.ViewController = ViewController;


  /* jshint strict:false */
  /* global Hashmapper */
  /* global ViewController */
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

  Marionette.viewStack.ViewStack = ViewStack;


  /* jshint strict:false */
  var ViewFactory = Object.create(null);

  ViewFactory = {
    create: function (name, options) { // jshint unused:false
      // do something
    }
  };

  ViewFactory.extend = Marionette.extend;

  Marionette.viewStack.ViewFactory = ViewFactory;


  /* jshint strict:false */
  /* global Hashmapper */
  var ViewCache = function (options) {
    this.options = options || {};
    this._hashmap = this.options.hashmap || this.getDefaultContainer();
  };

  ViewCache.prototype = {
    getDefaultContainer: function () {
      return new Hashmapper();
    },

    push: function (name, view, options) {
      // search if smart flag is set
      if (options && true === options.smart) {
        // automagically remove the view if destroyed
        var destroyCallback = _.partial(this.remove, name);
        view.once('destroy', _.bind(destroyCallback, this), this);
      }

      this._hashmap.add(name, view);
    },

    get: function (name) {
      return this._hashmap.get(name);
    },

    remove: function (name) {
      return this._hashmap.remove(name);
    }
  };

  ViewCache.extend = Marionette.extend;

  Marionette.viewStack.ViewCache = ViewCache;


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


  return Marionette.viewStack;
}));
