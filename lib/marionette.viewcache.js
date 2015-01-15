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
