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

(function() {
  var VALID_PROPERTIES = @PROPERTIES@;
  var CACHE_NAME_PREFIX = 'csstriggers';
  var CACHE_NAME_SUFFIX = '@VERSION@';
  var FILES_TO_CACHE = [
    '/index.html',
    '/scripts/css-triggers-core.js',
    '/styles/core.css',
    '/third_party/Roboto/Roboto-400.woff',
    '/third_party/Roboto/Roboto-500.woff',
    '/third_party/Roboto/RobotoMono-400.woff'
  ];
  var CACHE_NAME = CACHE_NAME_PREFIX + '-' + CACHE_NAME_SUFFIX;

  self.oninstall = function(event) {
    var reqs = FILES_TO_CACHE.map(function(url) {
      return new Request(url);
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

          var property = new URL(req.url).pathname.slice(1);
          if(property === '' || VALID_PROPERTIES.indexOf(property) !== -1) {
            return caches.match('/index.html');
          }
          return new Response('Not found', {status: 404});
        })
    );
  };
})();
