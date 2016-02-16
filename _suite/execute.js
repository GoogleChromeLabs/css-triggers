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
  chrome: {
    optionsFactory: () => new chrome.Options(),
    driverOptions: (drv, opts) => {
      opts.setPerfLoggingPrefs({
        "traceCategories": "blink.console,disabled-by-default-devtools.timeline,benchmark"
      });
      drv.forBrowser('chrome').setChromeOptions(opts);
      return drv;
    }
  },
  safari: {
    optionsFactory: () => new safari.Options(),
    driverOptions: (drv, opts) => drv.forBrowser('safari').setSafariOptions(opts),
  },
  firefox: {
    optionsFactory: () => new firefox.Options(),
    driverOptions: (drv, opts) => drv.forBrowser('firefox').setFirefoxOptions(opts),
  }
}

const args = process.argv.slice(2)
if(args.length != 2) {
  console.log('$ node execute.js <browser name>');
  console.log('For now, only "chrome" works, lol');
  process.exit(1);
}
const browser = args[0];
const suite = args[1];

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

driver.get(`http://localhost:8433/${suite}.html`);
driver.executeScript('console.profile("mutationmarker");console.time("mutationmarker2");');
driver.executeScript('go();');
driver.wait(() => driver.executeScript('return window.isDone;'));
driver.executeScript('console.profileEnd();console.timeEnd();');

driver.manage().logs().get(webdriver.logging.Type.PERFORMANCE).then(logs => {
  logs = logs.map(JSON.stringify.bind(JSON))
  var idx = logs.findIndex(x => x.indexOf('mutationmarker') !== -1);
  logs = logs.slice(idx);
  console.dir({
    layout: logs.filter(x => x.indexOf('performLayout') !== -1).length > 0,
    paint: logs.filter(x => x.indexOf('PaintImage') !== -1).length > 0,
    composite: logs.filter(x => x.indexOf('CompositeLayers') !== -1).length > 0
  });
  driver.quit();
  webServer.close();
});
