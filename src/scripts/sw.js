/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
  var VALID_PROPERTIES = @PROPERTIES@;
  var CACHE_NAME = 'csstriggers';
  var VERSION = '@VERSION@';
  var FILES_TO_CACHE = [
    '/index.html',
    '/scripts/css-triggers-core.js',
    '/styles/core.css',
    '/third_party/Roboto/Roboto-400.woff',
    '/third_party/Roboto/Roboto-500.woff',
    '/third_party/Roboto/RobotoMono-400.woff',
    '/manifest.json',
    '/favicon.ico',
    '/images/icon-192x192.png',
    '/images/icon-384x384.png',
    '/404.html'
  ];

  self.oninstall = function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function (cache) {
          return Promise.all(
            FILES_TO_CACHE
              .map(function(url) {
                // Make a request for each resource with cache buster
                // and If-Modified-Since header.
                return cache.match(url).then(function(cachedResponse) {
                  var opts = {
                    headers: {}
                  };
                  if(cachedResponse) {
                    opts.headers['If-Modified-Since'] = cachedResponse.headers['Last-Modified'];
                  }
                  return fetch(url+'?cache_bust=' + Date.now(), opts)
                    .then(function(response) {
                      if(response.status === 304) {
                        return;
                      }
                      return cache.put(url, response);
                    });
                });
              })
          );
      })
    );
  };

  // Always return index.html for valid properties, otherwise 404.html
  // Just pass through analytics
  self.onfetch = function (event) {
    var req = event.request;
    return event.respondWith(
      caches
        .match(req)
        .then(function (response) {
          if (response) {
            return response;
          }

          var property = new URL(req.url).pathname.slice(1);
          if (property === '' || VALID_PROPERTIES.indexOf(property) !== -1) {
            return caches.match('/index.html');
          }

          if (req.url.indexOf('analytics.js') !== -1) {
            return fetch(req);
          }

          return caches.match('/404.html');
        })
    );
  };
})();
