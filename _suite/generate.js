const handlebars = require('handlebars');
const fs = require('fs');

const valueSets = {
  time: ['1s', '2s'],
  direction: ['forward', 'backwards'],
  number: ['3', '4'],
  fraction: ['0.3', '0.5'],
  string: ['a', 'b'],
  box: ['border-box', 'content-box'],
  color: ['red', 'blue'],
  image: [
    'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiWMy7EiDAAAKwAVp2PgolAAAAAElFTkSuQmCC);',
    'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpicO4pBggwAAJYAUM3AaUJAAAAAElFTkSuQmCC);'
  ],
  percent: ['20%', '70%'],
  dualPercent: ['20% 20%', '70% 70%'],
  lineStyle: ['dashed', 'dotted'],
  verticalSide: ['top', 'bottom'],
  horizontalSide: ['left', 'right'],
  rect: [
    'rect(1px 1px 1px 1px)',
    'rect(2px 2px 2px 2px)'
  ],
  blendMode: ['multiply', 'overlay'],
  fit: ['cover', 'contain'],
  pageBreak: ['always', 'avoid'],
  axis: ['horizontal', 'vertical'],
  alignment: ['center', 'justify'],
  lineType: ['underline', 'overline'],
  shadow: ['1px 1px red', '2px 2px blue'],
  timingFunction: ['linear', 'ease-in-out'],
  flexPositions: ['flex-start', 'flex-end'],
}

const properties = {
  'animation-delay': valueSets['time'],
  'animation-direction': ['reverse', 'alternate'],
  'animation-duration': valueSets['time'],
  'animation-fill-mode': ['backwards', 'both'],
  'animation-iteration-count': valueSets['number'],
  'animation-name': valueSets['string'],
  'animation-play-state': ['paused'],
  'animation-timing-function': valueSets['timingFunction'],
  'background-attachment': ['fixed', 'scroll'],
  'background-blend-mode': valueSets['blendMode'],
  'background-clip': valueSets['box'],
  'background-color': valueSets['color'],
  'background-image': valueSets['image'],
  'background-origin': valueSets['box'],
  'background-position': valueSets['percent'],
  'background-repeat': ['repeat-x', 'repeat-y'],
  'background-size': valueSets['percent'],
  'border-bottom-color': valueSets['color'],
  'border-bottom-left-radius': valueSets['percent'],
  'border-bottom-right-radius': valueSets['percent'],
  'border-bottom-style': valueSets['lineStyle'],
  'border-bottom-width': valueSets['percent'],
  'border-collapse': ['collapse'],
  'border-image-outset': valueSets['percent'],
  'border-image-repeat': valueSets['axis'],
  'border-image-slice': valueSets['percent'],
  'border-image-source': valueSets['image'],
  'border-image-width': valueSets['percent'],
  'border-left-color': valueSets['color'],
  'border-left-style': valueSets['lineStyle'],
  'border-left-width': valueSets['percent'],
  'border-right-color': valueSets['color'],
  'border-right-style': valueSets['lineStyle'],
  'border-right-width': valueSets['percent'],
  'border-top-color': valueSets['color'],
  'border-top-left-radius': valueSets['percent'],
  'border-top-right-radius': valueSets['percent'],
  'border-top-style': valueSets['lineStyle'],
  'border-top-width': valueSets['percent'],
  'bottom': valueSets['percent'],
  'box-shadow': valueSets['shadow'],
  'box-sizing': valueSets['box'],
  'caption-side': valueSets['verticalSide'],
  'clear': valueSets['horizontalSide'],
  'clip': valueSets['rect'],
  'color': valueSets['color'],
  'content': valueSets['string'],
  'cursor': ['progress', 'wait'],
  'direction': ['rtl'],
  'display': ['table', 'flex'],
  'empty-cells': ['show', 'hide'],
  'float': valueSets['horizontalSide'],
  'font-family': valueSets['string'],
  'font-kerning': ['normal', 'none'],
  'font-size': valueSets['percent'],
  'font-size-adjust': valueSets['number'],
  'font-stretch': ['ultra-condensed', 'ultra-expanded'],
  'font-style': ['italic', 'oblique'],
  'font-variant': ['small-caps', 'common-ligatures'],
  'font-variant-ligatures': ['common-ligatures', 'historical-ligatures'],
  'font-weight': valueSets['fraction'],
  'height': valueSets['percent'],
  'image-rendering': ['crisp-edges', 'pixelated'],
  'isolation': ['isolate'],
  'justify-items': [], // TODO
  'justify-self': [], // TODO
  'left': valueSets['percent'],
  'letter-spacing': valueSets['percent'],
  'line-height': valueSets['percent'],
  'list-style-image': valueSets['image'],
  'list-style-position': ['outside', 'inside'],
  'list-style-type': ['circle', 'square'],
  'margin-bottom': valueSets['percent'],
  'margin-left': valueSets['percent'],
  'margin-right': valueSets['percent'],
  'margin-top': valueSets['percent'],
  'max-height': valueSets['percent'],
  'max-width': valueSets['percent'],
  'min-height': valueSets['percent'],
  'min-width': valueSets['percent'],
  'mix-blend-mode': valueSets['blendMode'],
  'object-fit': valueSets['fit'],
  'object-position': valueSets['percent'],
  'opacity': valueSets['fraction'],
  'orphans': valueSets['number'],
  'outline-color': valueSets['color'],
  'outline-offset': valueSets['percent'],
  'outline-style': valueSets['lineStyle'],
  'outline-width': valueSets['percent'],
  'overflow-wrap': [], // TODO
  'overflow-x': ['hidden', 'scroll'],
  'overflow-y': ['hidden', 'scroll'],
  'padding-bottom': valueSets['percent'],
  'padding-left': valueSets['percent'],
  'padding-right': valueSets['percent'],
  'padding-top': valueSets['percent'],
  'page-break-after': valueSets['pageBreak'],
  'page-break-before': valueSets['pageBreak'],
  'page-break-inside': valueSets['pageBreak'],
  'pointer-events': ['visiblePainted', 'visibleStroke'],
  'position': ['relative', 'absolute'],
  'resize': valueSets['axis'],
  'right': valueSets['percent'],
  'scroll-behavior': ['smooth'],
  'speak': [], // TODO
  'table-layout': ['fixed'],
  'tab-size': valueSets['number'],
  'text-align': valueSets['alignment'],
  'text-align-last': valueSets['alignment'],
  'text-decoration': valueSets['lineType'],
  'text-decoration-line': valueSets['lineType'],
  'text-decoration-style': valueSets['lineStyle'],
  'text-decoration-color': valueSets['color'],
  'text-justify': [], // TODO
  'text-underline-position': valueSets['horizontalSide'],
  'text-indent': valueSets['percent'],
  'text-rendering': ['optimizeSpeed', 'optimizeLegibility'],
  'text-shadow': valueSets['shadow'],
  'text-overflow': ['ellipsis'],
  'text-transform': ['uppercase', 'lowercase'],
  'top': valueSets['percent'],
  'touch-action': ['pan-x', 'pan-y'],
  'transition-delay': valueSets['time'],
  'transition-duration': valueSets['time'],
  'transition-property': ['left', 'righ'],
  'transition-timing-function': valueSets['timingFunction'],
  'unicode-bidi': ['embed', 'isolate'],
  'vertical-align': ['top', 'bottom'],
  'visibility': ['hidden', 'collapse'],
  'white-space': ['nowrap', 'pre'],
  'widows': valueSets['number'],
  'width': valueSets['percent'],
  'will-change': ['scroll-position', 'transform'],
  'word-break': ['break-all', 'keep-all'],
  'word-spacing': valueSets['percent'],
  'word-wrap': ['break-word'],
  'z-index': valueSets['number'],
  'zoom': valueSets['fraction'],
  'backface-visibility': ['hidden'],
  'backdrop-filter': ['blur(2px)', 'brightness(60%)'],
  'align-content': valueSets['flexPositions'],
  'align-items': valueSets['flexPositions'],
  'align-self': valueSets['flexPositions'],
  'flex-basis': valueSets['percent'],
  'flex-grow': valueSets['number'],
  'flex-shrink': valueSets['number'],
  'flex-direction': ['row-reverse', 'column'],
  'flex-wrap': ['wrap', 'wrap-reverse'],
  'justify-content': valueSets['flexPositions'],
  'order': valueSets['number'],
  'perspective': valueSets['percent'],
  'perspective-origin': valueSets['dualPercent'],
  'shape-outside': valueSets['box'],
  'shape-image-threshold': valueSets['fraction'],
  'shape-margin': valueSets['percent'],
  'transform': ['translateX(1px)', 'translateX(2px)'],
  'transform-origin': valueSets['percent'],
  'transform-style': ['preserve-3d'],
  'buffered-rendering': [], // TODO
  'clip-path': ['fill-box', 'stroke-box'],
  'mask': valueSets['image'],
  'mask-type': ['alpha'],
  'writing-mode': ['vertical-rl', 'vertical-lr'],
};

const template = handlebars.compile(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width">

  <title>backface-visibility</title>
  <style>
    #targetElement {
      will-change: backface-visibility;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAARklEQVQ4EWOcPn36fwYaABaQmY6OjlQ1ev/+/QxMVDURybBRg+GBMRoUo0EBDwE4YzRVjAYFPATgjNFUAQ8KcJ0HqqOoDQC9BAgxeGiZ2QAAAABJRU5ErkJggg==);


      {{#if initialValue}}
        {{property}}: {{initialValue}};
      {{/if}}
    }

    #targetElement.active, #targetElement.active * {
      {{property}}: {{activeValue}};
    }

    #surround {
      border: 3px solid #000;
    }

    #siblingPrevious {
      float: left;
      width: 50%;
    }
  </style>
</head>
<body>

  <button id="gogogo" onclick="go()">Go</button>

  <div id="surround">
    <div id="siblingPrevious">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at consequat mauris, tempor lacinia nibh. Maecenas cursus lacinia nulla et sollicitudin. Ut dignissim risus ac purus vulputate volutpat. Suspendisse pharetra eget neque id vestibulum. Nunc vestibulum interdum neque. Aenean cursus ultrices turpis id pharetra. Suspendisse potenti. Praesent non lorem quis nulla hendrerit elementum. Duis pellentesque fringilla varius. Suspendisse potenti. Vestibulum et nisl sed tortor tincidunt fermentum. Nunc ut dolor in ligula consectetur elementum porta vulputate nisi. Curabitur vitae leo fermentum, feugiat tortor vel, fringilla nunc.</div>
    <div id="targetElement">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at consequat mauris, tempor lacinia nibh. Maecenas cursus lacinia nulla et sollicitudin. Ut dignissim risus ac purus vulputate volutpat. Suspendisse pharetra eget neque id vestibulum. Nunc vestibulum interdum neque. Aenean cursus ultrices turpis id pharetra. Suspendisse potenti. Praesent non lorem quis nulla hendrerit elementum. Duis pellentesque fringilla varius. Suspendisse potenti. Vestibulum et nisl sed tortor tincidunt fermentum. Nunc ut dolor in ligula consectetur elementum porta vulputate nisi. Curabitur vitae leo fermentum, feugiat tortor vel, fringilla nunc.
      <ul>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </ul>
    </div>
    <div id="siblingNext">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at consequat mauris, tempor lacinia nibh. Maecenas cursus lacinia nulla et sollicitudin. Ut dignissim risus ac purus vulputate volutpat. Suspendisse pharetra eget neque id vestibulum. Nunc vestibulum interdum neque. Aenean cursus ultrices turpis id pharetra. Suspendisse potenti. Praesent non lorem quis nulla hendrerit elementum. Duis pellentesque fringilla varius. Suspendisse potenti. Vestibulum et nisl sed tortor tincidunt fermentum. Nunc ut dolor in ligula consectetur elementum porta vulputate nisi. Curabitur vitae leo fermentum, feugiat tortor vel, fringilla nunc.</div>
  </div>
  <script>

    window.isDone = false;

    function go(cb) {

      var targetElement = document.getElementById('targetElement');
      targetElement.classList.add('active');

      setTimeout(function(){
        window.isDone = true;
        (cb || function(){})();
      }, 1000);
    }

    function gogo() {
      console.profile();
      go(console.profileEnd.bind(console));
    }
  </script>
</body>
</html>`);

fs.mkdirSync('html');
Object.keys(properties).forEach(property => {
  var values = properties[property];
  if(values.length == 0) {
    return;
  }
  if(values.length == 2) {
    fs.writeFileSync(
      `html/${property}-change.html`,
      template({property, initialValue: values[0], activeValue: values[1]})
    );
    values.shift();
  }
  fs.writeFileSync(
    `html/${property}-initial.html`,
    template({property, activeValue: properties[property][0]})
  );
});
