/* jshint strict:false */
var ViewCache = function (options) {
  this.options = options || {};
  this.viewContainer = options.container || this.getDefaultContainer();
};

ViewCache.prototype = {
  getDefaultContainer: function () {
    return new Container();
  },

  push: function (name, view, options) {
    // search if smart flag is set
    if (options && true === options.smart) {
      // automagically remove the view if destroyed
      var destroyCallback = _.partial(this.remove, name);
      view.once('destroy', _.bind(destroyCallback, this), this);
    }

    this.viewContainer.add(name, view);
  },

  get: function (name) {
    return this.viewContainer.get(name);
  },

  remove: function (name) {
    return this.viewContainer.remove(name);
  }
};

ViewCache.extend = Marionette.extend;

Marionette.viewStack.ViewCache = ViewCache;
