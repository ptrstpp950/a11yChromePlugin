(function () {

  axe._audit.addTool({
    id: 'chrome-get-frame-url',
    options: {},
    source: {
      run: function (element, options, callback) {
        callback(window.location.href.replace(window.location.hash, ''));
      },
      cleanup: function (cb) {
        cb();
      }
    }
  });

}());