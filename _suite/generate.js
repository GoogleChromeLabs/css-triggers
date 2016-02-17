const handlebars = require('handlebars');
const fs = require('fs');

const properties = require('./properties.json');

const additionalProperties = {
  'z-index': {'position': 'absolute'},
  'top': {'position': 'absolute'},
  'left': {'position': 'absolute'},
  'right': {'position': 'absolute'},
  'bottom': {'position': 'absolute'},
  'border-top-color': {'border-style': 'solid'},
  'border-top-width': {'border-style': 'solid'},
  'border-top-left-radius': {'border-style': 'solid'},
  'border-top-right-radius': {'border-style': 'solid'},
  'border-left-color': {'border-style': 'solid'},
  'border-left-width': {'border-style': 'solid'},
  'border-right-color': {'border-style': 'solid'},
  'border-right-width': {'border-style': 'solid'},
  'border-bottom-color': {'border-style': 'solid'},
  'border-bottom-width': {'border-style': 'solid'},
  'border-bottom-left-radius': {'border-style': 'solid'},
  'border-bottom-right-radius': {'border-style': 'solid'},
  'clip': {'position': 'absolute'},
  'outline-width': {'outline-style': 'solid'},
  'outline-color': {'outline-style': 'solid'},
  'outline-offset': {'outline-style': 'solid'},
}

const template = handlebars.compile(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width">

  <title>{{property}}</title>
  <style>
    #targetElement, #targetElement * {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAARklEQVQ4EWOcPn36fwYaABaQmY6OjlQ1ev/+/QxMVDURybBRg+GBMRoUo0EBDwE4YzRVjAYFPATgjNFUAQ8KcJ0HqqOoDQC9BAgxeGiZ2QAAAABJRU5ErkJggg==);

      will-change: {{property}};
      {{#each additionalProperties}}
        {{@key}}: {{this}};
      {{/each}}
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
      <table>
        <tr>
          <td>a</td>
          <td>b</td>
        </tr>
        <tr>
          <td>c</td>
          <td>d</td>
        </tr>
      </table>
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

try {
  fs.mkdirSync('html');
}catch(e){}
Object.keys(properties).forEach(property => {
  var values = properties[property].slice();
  if(values.length == 0) {
    return;
  }
  if(values.length == 2) {
    fs.writeFileSync(
      `html/${property}-change.html`,
      template({
        property,
        initialValue: values[0],
        activeValue: values[1],
        additionalProperties: additionalProperties[property]
      })
    );
    values.shift();
  }
  fs.writeFileSync(
    `html/${property}-initial.html`,
    template({
      property,
      activeValue: properties[property][0],
      additionalProperties: additionalProperties[property]
    })
  );
});
