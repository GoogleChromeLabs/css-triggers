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
