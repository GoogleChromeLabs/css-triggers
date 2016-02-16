const webdriver = require('selenium-webdriver'),
  By = require('selenium-webdriver').By,
  until = require('selenium-webdriver').until,
  safari = require('selenium-webdriver/safari'),
  chrome = require('selenium-webdriver/chrome'),
  firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const http = require('http');
const static = require('node-static');

const browsers = {
  blink: {
    optionsFactory: () => new chrome.Options(),
    driverOptions: (drv, opts) => {
      opts.setPerfLoggingPrefs({
        "traceCategories": [
          'blink.console',
          'devtools.timeline',
          'toplevel',
          'disabled-by-default-devtools.timeline',
          'disabled-by-default-devtools.timeline.frame'
        ].join(',')
      });
      drv.forBrowser('chrome').setChromeOptions(opts);
      return drv;
    },
    detect: logs => {
      return {
        layout: logs.filter(x => x.indexOf('\\"Layout\\"') !== -1).length > 0,
        paint: logs.filter(x => x.indexOf('\\"Paint\\"') !== -1).length > 0,
        composite: logs.filter(x => x.indexOf('\\"CompositeLayers\\"') !== -1).length > 0
      };
    }
  },
  webkit: {
    optionsFactory: () => new safari.Options(),
    driverOptions: (drv, opts) => drv.forBrowser('safari').setSafariOptions(opts),
  },
  gecko: {
    optionsFactory: () => new firefox.Options(),
    driverOptions: (drv, opts) => drv.forBrowser('firefox').setFirefoxOptions(opts),
  }
}

const args = process.argv.slice(2)
if(args.length != 1) {
  console.log('$ node execute.js <browser name>');
  console.log('For now, only "blink" works, lol');
  process.exit(1);
}
const browser = args[0];

const fileServer = new static.Server('./html');
const webServer = http.createServer((req, resp) => {
  req.addListener('end', function () {
    fileServer.serve(req, resp);
  }).resume();
}).listen(8433);

var options = browsers[browser].optionsFactory();
var loggingPrefs = new webdriver.logging.Preferences();
loggingPrefs.setLevel(webdriver.logging.Type.PERFORMANCE, webdriver.logging.Level.ALL);
options.setLoggingPrefs(loggingPrefs);

var driver = new webdriver.Builder();
driver = browsers[browser].driverOptions(driver, options).build();

const suites = fs.readdirSync('./html').map(s => s.slice(0, -5));
var data = {};
suites.reduce((p, suite) => {
  return p
    .then(() => driver.get(`http://localhost:8433/${suite}.html`))
    .then(() => driver.executeScript('console.profile("mutationmarker");console.time("mutationmarker2");go();'))
    .then(() => driver.wait(() => driver.executeScript('return window.isDone;')))
    .then(() => driver.executeScript('console.profileEnd();console.timeEnd();'))
    .then(() => driver.manage().logs().get(webdriver.logging.Type.PERFORMANCE))
    .then(logs => {
      logs = logs.map(JSON.stringify.bind(JSON))
      var idx = logs.findIndex(x => x.indexOf('mutationmarker') !== -1);
      logs = logs.slice(idx);
      // fs.writeFileSync(`${browser}-${suite}.json`, logs);
      data[suite] = browsers[browser].detect(logs);
    });
}, Promise.resolve(0))
.then(() => {
  driver.quit();
  webServer.close();
})
.then(() => {
  // Check for invalid trigger sequences like layout without paint etc.
  const triggers = Object.keys(data)
    .map(key => {
      return {
        key: key,
        trigger: ['layout','paint','composite'].map(x => ''+data[key][x]).join('')
      };
    })
    .map(prop => {
      return {
        key: prop.key,
        trigger: ['truetruetrue','falsetruetrue','falsefalsetrue','falsefalsefalse'].indexOf(prop.trigger)
      };
    });
  const idx = triggers.map(prop => prop.trigger === -1).indexOf(true);
  if(idx !== -1) {
    console.log('Found invalid trigger sequence');
    console.log(idx, triggers[idx]);
    console.log(JSON.stringify(data[triggers[idx].key]));
  }

  fs.writeFileSync(`../data/${browser}.json`, JSON.stringify({properties:data}));
});
