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

var VALID_PROPERTIES = @PROPERTIES@;
var CACHE_NAME_PREFIX = 'csstriggers';
var VERSION = '@VERSION@';

// Dynamic files are expected to change every now and then
var DYNAMIC_CACHE = CACHE_NAME_PREFIX + '-dynamic';
var DYNAMIC_FILES = [
  '/index.html',
  '/scripts/css-triggers-core-@VERSION@.js',
  '/404.html'
];

// Static files are expected to stay the same forever
var STATIC_CACHE = CACHE_NAME_PREFIX + '-static';
var STATIC_FILES = [
  '/third_party/MaterialIcons/ic_close_white_18px.svg',
  '/third_party/MaterialIcons/ic_search_white_24px.svg',
  '/third_party/Roboto/Roboto-400.woff',
  '/third_party/Roboto/Roboto-500.woff',
  '/third_party/Roboto/RobotoMono-400.woff',
  '/manifest.json',
  '/favicon.ico',
  '/images/icon-192x192.png',
  '/images/icon-384x384.png',
];

function cacheStaticFiles() {
  return caches.open(STATIC_CACHE)
    .then(function(cache) {
      return cache.addAll(STATIC_FILES);
    });
}

function cacheDynamicFiles() {
  return caches.open(DYNAMIC_CACHE)
      .then(function(cache) {
        // We are not using cache.addAll() here because that would stop all
        // caching on a non 2xx status code. 404.html will be delivered with a
        // 404 status code, and we want to cache it anyways.
        return DYNAMIC_FILES.map(url => {
          return fetch(url)
              .then(
                response => cache.put(url, response),
                err => {}
              );
        });
      });
}

self.oninstall = function (event) {
  event.waitUntil(
    Promise.all([cacheStaticFiles(), cacheDynamicFiles()])
  );
};

self.onfetch = function (event) {

  var req = event.request;

  // Attempt to get the request from the cache. This will work for static
  //files without additional work. For everything else, like deeplinks,
  //analytics or 404s, we have more work to do.
  return event.respondWith(
    caches
      .match(req)
      .then(function (response) {

        // If there's a cache match, we're done.
        if (response) {
          return response;
        }

        // Figure out exactly which property the user wanted to get at.
        var property = new URL(req.url).pathname.slice(1);

        // If this is a valid property, spin up the index.html file.
        if (property === '' || VALID_PROPERTIES.indexOf(property) !== -1) {
          return caches.match('/index.html');
        }

        // Except for analytics; that we will fetch.
        if (req.url.indexOf('google-analytics') !== -1) {
          return fetch(req);
        }

        // And everything else is going to get the 404.
        return caches.match('/404.html');
      })
  );
};
