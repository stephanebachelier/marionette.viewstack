var ViewController = function (options) {
  this.options = options;
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

  show: function (view, options, region) {
    return this.showIn(region || this.buildRegion(options), view);
  },

  showIn: function (region, view) {
    if (!region) {
      throw new Error('Region not defined');
    }

    if (!this.el.contains(region.el)) {
      this.el.appendChild(region.el);
    }

    this.triggerMethod('before:view:show', region, view);
    region.show(view);
    this.triggerMethod('view:show', region, view);

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
  }
};

ViewController.extend = Marionette.extend;

Marionette.ViewController = ViewController;
