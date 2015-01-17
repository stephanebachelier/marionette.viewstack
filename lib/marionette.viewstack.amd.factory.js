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

    var promise = new Promise(function (resolve, reject) {
      if (!self._views[name]) {
        reject('No view registered with the name [' + name + ']');
      }

      if (self._viewClasses && self._viewClasses[name]) {
        resolve(self.syncPush(name, options, viewStackOptions));
      }

      self.load(self._views[name], function (ViewClass) {
        if (!ViewClass) {
          reject('No view implementation found with the name [' + name + ']');
          return;
        }

        if (!self._viewClasses) {
          self._viewClasses = {};
        }

        self._viewClasses[name] = ViewClass;

        // resolve is pass the result of the original push function
        resolve(self.syncPush(name, options, viewStackOptions));
      });
    });

    return promise;
  },

  load: function (dep, cb) {
    require([dep], cb);
  }
});

ViewStackAmdFactory.extend = Marionette.extend;

Marionette.viewStack.ViewStackAmdFactory = ViewStackAmdFactory;
