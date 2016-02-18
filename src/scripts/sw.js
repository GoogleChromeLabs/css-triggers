(function() {
  var CACHE_NAME_PREFIX = 'csstriggers';
  var CACHE_NAME_SUFFIX = '@VERSION@';
  var FILES_TO_CACHE = [
    '/index.html',
    '/scripts/css-triggers-core.js',
    '/styles/core.css'
  ];
  var CACHE_NAME = CACHE_NAME_PREFIX + '-' + CACHE_NAME_SUFFIX;

  self.oninstall = function(event) {
    var reqs = FILES_TO_CACHE.map(function(url) {
      return new Request(url)
    });

    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.addAll(reqs);
        })
    );
  };

  // This only cleans old caches
  self.onactivate = function(event) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith(CACHE_NAME_PREFIX);
        }).filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(caches.delete.bind(caches))
      );
    });
  };

  // Always return index.html
  self.onfetch = function(event) {
    var req = event.request;
    return event.respondWith(
      caches
        .match(req)
        .then(function(response) {
          if(response) {
            return response;
          }

          return caches.match('/index.html');
        })
    );
  };
})();
