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

var fs = require('fs');
var blink = JSON.parse(fs.readFileSync('../data/blink.json'));
var gecko = JSON.parse(fs.readFileSync('../data/gecko.json'));
var webkit = JSON.parse(fs.readFileSync('../data/webkit.json'));
var edgehtml = JSON.parse(fs.readFileSync('../data/edgehtml.json'));

var newData = {'data': {}};
var props = Object.keys(blink.properties);

for (var p = 0; p < props.length; p++) {

  var newProp = props[p]
      .replace('-initial', '')
      .replace('-change', '');

  var tag = props[p].endsWith('initial') ? 'initial' : 'change';

  if (!newData.data[newProp]) {

    console.log('Making ' + newProp);
    createProp(newProp);
  }

  Object.assign(newData.data[newProp][tag].blink, blink.properties[props[p]]);
  Object.assign(newData.data[newProp][tag].gecko, gecko.properties[props[p]]);
  Object.assign(newData.data[newProp][tag].webkit, webkit.properties[props[p]]);
  Object.assign(newData.data[newProp][tag].edgehtml,
      edgehtml.properties[props[p]]);
}

fs.writeFileSync('../data/data.json', JSON.stringify(newData));

function createProp (name) {
  newData.data[name] = {
    'initial': {
      'blink': {
        'layout': null,
        'paint': null,
        'composite': null
      },

      'gecko': {
        'layout': null,
        'paint': null,
        'composite': null
      },

      'webkit': {
        'layout': null,
        'paint': null,
        'composite': null
      },

      'edgehtml': {
        'layout': null,
        'paint': null,
        'composite': null
      }
    },
    'change': {
      'blink': {
        'layout': null,
        'paint': null,
        'composite': null
      },

      'gecko': {
        'layout': null,
        'paint': null,
        'composite': null
      },

      'webkit': {
        'layout': null,
        'paint': null,
        'composite': null
      },

      'edgehtml': {
        'layout': null,
        'paint': null,
        'composite': null
      }
    }
  };
}
