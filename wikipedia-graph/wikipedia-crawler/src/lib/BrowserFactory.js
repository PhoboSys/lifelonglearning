"use strict";

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var driver = require('selenium-webdriver/lib/webdriver');
var Condition = driver.Condition;
var Builder = webdriver.Builder;

var Config = require("./Config");
var Scripts = require("./Scripts");

var twitter_search = {
  login_input: { "css": ".js-username-field.email-input.js-initial-focus" },
  pwd_input: { "css": ".js-password-field" },
  enter_btn: { "css": "button.submit.btn.primary-btn" },
  tweet: { "css": ".js-stream-item.stream-item.stream-item" }
};

var re = new RegExp("^(\\w+):\\s+(\\d+)", "im");
var _getMemReport = function(factor) {
  return new Promise(function(res, rej) {
    fs.readFile('/proc/meminfo', 'utf8', function(err, data) {
      if(err) {
        rej(err);
        return;
      }
      var chain = _.chain(data.toString().split("\n"))
        .map(_.bind(re.exec, re))
        .map(_.drop)
        .filter(_.some);

      var keys = chain.map(0).value();
      var values = chain.map(1)
        .map(function(kbytes) {
          kbytes = parseInt(kbytes);
          if (factor === "M") kbytes = Math.floor(kbytes / 1024 * 10) / 10;
          if (factor === "G") kbytes = Math.floor(kbytes / (1024 * 1042) * 10) / 10;
          return kbytes;
        }).value();

      res(_.zipObject(keys, values));
    });
  });
}

var CAPABILITIES = {
  chrome: function() {
    var config = Config.getConfig();
    var options = new chrome.Options();
    var switches = [
      "ignore-certificate-errors",
      "privileged",
      "disable-reading-from-canvas"
    ];
    switches.push("user-agent=" + _.sample(config.userAgents));

    options.addArguments(switches);
    //prevent images loading
    options.setUserPreferences({"profile.managed_default_content_settings.images": 2});
    return options.toCapabilities();
  },
  phantomjs: function() {
    var capabilities = webdriver.Capabilities.phantomjs();
    capabilities.set("phantomjs.binary.path", "/usr/bin/phantomjs");
    capabilities.set("phantomjs.cli.args", [
      "--ignore-ssl-errors=yes",
      "--ssl-protocol=any",
      "--ssl-ciphers=any"
    ]);
    return capabilities;
  }
}

var _urlIsNot = function(url) {
  return new Condition(
    'for URL not to be ' + JSON.stringify(url),
    function(dr) {
      return dr.getCurrentUrl().then(function(u) {
        return u !== url;
      });
    });
};

var _waitUrlChange = function(browser, url, timeout) {
  return browser.wait(_urlIsNot(url), timeout);
}

var _noActivejQueryAjax = function() {
  return new Condition(
    'for jQuery ajax requests count to be 0',
    function(dr) {
      return dr.executeScript(Scripts.countAjax).then(function(count) {
        return +count === 0;
      });
    });
}

var _cleanUpTwitterPage = function(browser) {
  return browser.executeScript(Scripts.cleanUpTwitterPage);
}

var _loadNewerTweets = function(browser, timeout) {
  console.log("loading newer tweets");
  return browser.executeScript(Scripts.loadNewerTweets)
    .then(_.bind(browser.wait, browser, _noActivejQueryAjax, 1000));
}

var _loadOlderTweets = function(browser, timeout) {
  console.log("loading older tweets");
  return browser.executeScript(Scripts.loadOlderTweets)
    .then(_.bind(browser.wait, browser, _noActivejQueryAjax, timeout || 1000))
}

var _loadMoreTweets = function(browser, timeout) {
  return _loadOlderTweets(browser, timeout)
    .then(_.partial(_loadNewerTweets, browser, timeout));
}

var _findWebElementTweets = function(browser) {
  return browser.findElements(twitter_search.tweet)
    .then(function(tweets) {
      console.log(tweets.length + " tweets on the page");
      return tweets;
    });
}

var _ensureUrl = function(browser, url) {
  return new Promise(function(res, rej) {
    if (typeof url !== "string") {
      rej(new Error("url arg is now a string"));
      return;
    }
    browser.getCurrentUrl().then(function(current_url) {
      if (url !== current_url) {
        console.log("getting new url", url);
        browser.get(url).then(res, rej);
      } else {
        res();
      }
    }, rej);
  });
}

var _getTwitterSearchPage = function(browser) {
  return browser.getCurrentUrl()
    .then(function(current_url) {
      var config = Config.getConfig();
      var url = config.targetPageUri;
      if (url !== current_url) {
        console.log("getting Twitter page prepared url", url);
        return browser.get(url)
          .then(_.bind(browser.executeScript, browser, Scripts.preparePage))
          .then(_.bind(browser.executeScript, browser, Scripts.prepareTwitterPage));
      }
    });
}

var _getTwitterUserPage = function(browser, user) {
  var config = Config.getConfig();
  return _getMemReport("M")
    .then(function(mem) {
      if ((mem.MemAvailable / mem.MemTotal) < config.minMemRatio) {
        var ratio = Math.floor(mem.MemAvailable / mem.MemTotal * 100);
        throw new Error("Low memory " + ratio + "% left.");
      }
    })
    .then(_.bind(browser.getCurrentUrl, browser))
    .then(function(current_url) {
      var url = config.getTwitterUserUri(user);
      if (url !== current_url) {
        console.log("getting Twitter user page url", url);
        return browser.get(url)
          .then(_.bind(browser.wait, browser, _noActivejQueryAjax, 1000))
          .then(_.bind(browser.executeScript, browser, Scripts.preparePage));
      }
    });
}

var _mkdirParent = function(dirPath, mode, callback) {
  fs.mkdir(dirPath, mode, function(error) {
    if (error && error.errno === 34) {
      _mkdirParent(path.dirname(dirPath), mode, callback);
      _mkdirParent(dirPath, mode, callback);
    }
    callback && callback(error);
  });
};

var _takeScreenshot = function(browser, filepath) {
  return browser._takeScreenshot().then(function(data) {
    _mkdirParent(path.dirname(filepath));
    fs.writeFile(filepath, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
      if(err) throw err;
    });
  });
}

var _getJsErrors = function(browser) {
  return browser.findElement({ "css": "body" })
    .getAttribute("JSError");
}

var _getUserAgent = function(browser) {
  return browser.executeScript(Scripts.getUserAgent);
}

var _browser;
var _create = function(capabilities_type) {
  console.log("creating new", capabilities_type, "browser instance");
  var capabilities = CAPABILITIES[capabilities_type]();
  var browser = new Builder()
    .withCapabilities(capabilities)
    .forBrowser(capabilities_type)
    .build();

  var config = Config.getConfig();
  if (config.width && config.height) {
    browser.manage().window().setSize(config.width, config.height);
  }

  browser.getJsErrors = _.partial(_getJsErrors, browser);
  browser.getTwitterSearchPage = _.partial(_getTwitterSearchPage, browser);
  browser.findWebElementTweets = _.partial(_findWebElementTweets, browser);
  browser.waitUrlChange = _.partial(_waitUrlChange, browser);
  browser.loadMoreTweets = _.partial(_loadMoreTweets, browser);
  browser.cleanUpTwitterPage = _.partial(_cleanUpTwitterPage, browser);
  browser.ensureUrl = _.partial(_ensureUrl, browser);
  browser.getUserAgent = _.partial(_getUserAgent, browser);

  browser.getTwitterUserPage = _.partial(_getTwitterUserPage, browser);

  browser._takeScreenshot = browser.takeScreenshot;
  browser.takeScreenshot = _.partial(_takeScreenshot, browser);

  browser._quit = browser.quit;
  browser.quit = function(e) {
    console.log("exiting browser because of", e);
    var browser = _browser;
    _browser = null;
    browser._quit();
  };

  return browser;
}

var _ensureIsOpenedOrCreate = function(capabilities) {
  if (!_browser) _browser = _create(capabilities);
  return _browser.getUserAgent()
    .then(function(userAgent) {
      console.log("browser will use agent string", userAgent);
      return _browser;
    });
}

module.exports = {
  get: function(capabilities_type) {
    if(!(capabilities_type in _.keys(CAPABILITIES))) capabilities_type = _.first(_.keys(CAPABILITIES));

    return _ensureIsOpenedOrCreate(capabilities_type);
  }
};

