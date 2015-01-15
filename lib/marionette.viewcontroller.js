var ViewController = function (options) {
  this.options = options || {};
  this._ensureElement();
  this.stucked = []; // store stucked elements at the top
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

  injectElement: function (region, options) {
    var sticky = options && options.sticky;

    if (!this.el.contains(region.el)) {
      this.el.appendChild(region.el);
    }
    else {
      var length = this.stucked.length;
      if (length) {
        var index = 0;
        var attachedNode;
        for (; !attachedNode && (index < length - 1); index += 1) {
          attachedNode = this.stucked[index].parentNode ? this.stucked[index] : undefined;
        }
        // passing undefined seems ok and is equivalent to appendChild
        this.el.insertBefore(region.el, attachedNode);
      }
      else {
        this.el.appendChild(region.el);
      }
    }

    if (sticky) {
      this.stucked.push(region.el);
    }
  },

  show: function (view, options) {
    return this.showIn(null, view, options);
  },

  showIn: function (region, view, options) {
    region = region || this.buildRegion(options);

    this.injectElement(region, options);

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

    // remove reference in stucked elements if it exists
    var index = this.stucked.indexOf(region.el);
    if (-1 !== index) {
      this.stucked = this.stucked.splice(index, 1);
    }

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

  swap: function (region, options) {
    if (!this.el.contains(region.el)) {
      return false;
    }

    this.injectElement(region, options);
  },

  triggerMethod: Marionette.triggerMethod
};

ViewController.extend = Marionette.extend;

Marionette.viewStack.ViewController = ViewController;
