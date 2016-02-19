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

export default class ServiceWorkerController {
  constructor () {

    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          registration.onupdatefound = event => {

            console.log('A new Service Worker version has been found...');

            // If an update is found the spec says that there is a new Service
            // Worker installing, so we should wait for that to complete then
            // show a notification to the user.
            registration.installing.onstatechange = function (evt) {

              if (this.state === 'installed') {
                console.log('Service Worker Installed (version @VERSION@).');
              } else {
                console.log('New Service Worker state: ', this.state);
              }

            };
          };
        }, err => {
          console.warn(err);
        });
  }
}
