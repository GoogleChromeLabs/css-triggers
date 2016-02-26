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
  var CACHE_NAME_PREFIX = 'csstriggers';
  var VERSION = '@VERSION@';
  // Static files are expected to change every now and then
  var DYNAMIC_CACHE = CACHE_NAME_PREFIX + '-dynamic';
  var DYNAMIC_FILES = [
    '/index.html',
    '/scripts/css-triggers-core-@VERSION@.js',
    '/404.html'
  ];
  // Static files are expected to stay the same forever
  var STATIC_CACHE = CACHE_NAME_PREFIX + '-static';
  var STATIC_FILES = [
    '/third_party/Roboto/Roboto-400.woff',
    '/third_party/Roboto/Roboto-500.woff',
    '/third_party/Roboto/RobotoMono-400.woff',
    '/manifest.json',
    '/favicon.ico',
    '/images/icon-192x192.png',
    '/images/icon-384x384.png',
  ];

  function cacheStaticFiles() {
    return caches.has(STATIC_CACHE)
      .then(function(cacheExists) {
        // Static files never need to be refreshed. If the cache exists,
        // we are done
        if(cacheExists) {
          return;
        }
        return caches.open(STATIC_CACHE)
          .then(function(cache) {
            return cache.addAll(STATIC_FILES);
          });
      });
  }

  function cacheDynamicFiles() {
    return caches.open(DYNAMIC_CACHE)
      .then(function(cache) {
        return cache.addAll(DYNAMIC_FILES);
      });
  }

  self.oninstall = function (event) {
    event.waitUntil(
      Promise.all([cacheStaticFiles(), cacheDynamicFiles()])
    );
  };

  // Always return index.html
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
