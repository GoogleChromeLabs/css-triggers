var fs = require('fs');
var blink = JSON.parse(fs.readFileSync('data/blink.json'));
var gecko = JSON.parse(fs.readFileSync('data/gecko.json'));

var newData = {'data': {}};
var props = Object.keys(blink.properties);

for (var p = 0; p < props.length; p++) {

  var newProp = props[p]
      .replace('-initial', '')
      .replace('-change', '');

  var tag = props[p].endsWith('initial') ? 'initial' : 'change';

  if (!newData.data[newProp]) {
    createProp(newProp);
  }

  newData.data[newProp][tag].blink.layout =
      blink.properties[props[p]].layout;
  newData.data[newProp][tag].blink.paint =
      blink.properties[props[p]].paint;
  newData.data[newProp][tag].blink.composite =
      blink.properties[props[p]].composite;

  newData.data[newProp][tag].gecko.layout =
      gecko.properties[props[p]].layout;
  newData.data[newProp][tag].gecko.paint =
      gecko.properties[props[p]].paint;
  newData.data[newProp][tag].gecko.composite =
      gecko.properties[props[p]].composite;
}

fs.writeFileSync('data/data.json', JSON.stringify(newData));

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
