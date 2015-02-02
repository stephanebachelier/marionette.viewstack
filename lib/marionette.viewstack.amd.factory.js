var ViewStackAmdFactory = ViewStackFactory.extend({
  getViewFactory: function (name) {
    var factory = this._viewClasses ? this._viewClasses[name] : null;
    if (!factory) {
      throw new Error('Cannot find [' + name + '] view factory.');
    }

    return factory;
  },

  syncPush: ViewStackFactory.prototype.push,

  push: function (name, options, viewStackOptions) {
    var self = this;

    return this.load(name).then(function (ViewClass) { // jshint unused:false
      return self.syncPush(name, options, viewStackOptions);
    });
  },

  renderSync: ViewStackFactory.prototype.render,

  render: function (name, options) {
    var self = this;

    return this.load(name).then(function (ViewClass) { // jshint unused:false
      return self.renderSync(name, options);
    });
  },

  renderInSync: ViewStackFactory.prototype.renderIn,

  renderIn: function (name, options) {
    var self = this;

    return this.load(name).then(function (ViewClass) { // jshint unused:false
      return self.renderInSync(name, options);
    });
  },

  load: function (name) {
    var self = this;

    return new Promise(function (resolve, reject) {
      if (!self._views[name]) {
        reject('No view registered with the name [' + name + ']');
        return;
      }

      if (self._viewClasses && self._viewClasses[name]) {
        resolve(self._viewClasses[name]);
        return;
      }

      self._load(self._views[name], function (ViewClass) {
        if (!ViewClass) {
          reject('No view implementation found with the name [' + name + ']');
          return;
        }

        if (!self._viewClasses) {
          self._viewClasses = {};
        }

        self._viewClasses[name] = ViewClass;

        resolve(ViewClass);
      });
    });
  },

  _load: function (dep, cb) {
    require([dep], cb);
  }
});

ViewStackAmdFactory.extend = Marionette.extend;

Marionette.viewStack.ViewStackAmdFactory = ViewStackAmdFactory;
