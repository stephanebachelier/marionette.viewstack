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
    this.viewContainer.add(name, view);
  },

  get: function (name) {
    return this.viewContainer.get(name);
  },

  remove: function (name) {
    return this.viewContainer.remove(name);
  }
};
