"use strict";

var _ = require("lodash");
var UserAgentsList = require("./UserAgentsList");

var TARGET_PAGE_URI_TEMPLATE = "https://twitter.com/search?f=tweets&vertical=default&q=${search}%20lang%3Aen${until}&src=typd";
var TWITTER_USER_PAGE = "https://twitter.com/";

function _getTwitterUserUri(username) {
  return TWITTER_USER_PAGE + username.replace("@", "");
}

function _getTwitterSearchUri(search, env_name) {
  var until = process.env.CRAWLER_UNTIL_DATE;
  until = until && new Date(_.get(JSON.parse(until), env_name));

  var strUntil = "";
  if (until instanceof Date && !isNaN(until)) {
    strUntil = "%20until%3A" + until.toISOString().split('T')[0];
  }
  return _.template(TARGET_PAGE_URI_TEMPLATE)({
    search: search.toLowerCase(),
    until: strUntil
  });
}

var USER_MODE = "usersmode";
function _getConfig() {
  var env_name = process.env.ENV_NAME;

  var isUserMode = USER_MODE === env_name;
  var search = env_name;
  if (!isUserMode) {
    var words = process.env.CRAWLER_SEARCH_WORDS;
    search = _.get(JSON.parse(words), env_name);
    if (!search) {
      throw new Error("search word is not provided for " + env_name);
    }
  }

  return {
    updateTweets: process.env.UPDATE_TWEETS,
    getTwitterUserUri: _getTwitterUserUri,
    targetPageUri: _getTwitterSearchUri(search, env_name),
    minMemRatio: 0.15,
    usersUpdateSize: 5,
    usersInsertSize: 10,
    userAgents: UserAgentsList,
    width: +process.env.SCREEN_WIDTH,
    height: +process.env.SCREEN_HEIGHT,
    usersmode: isUserMode,
    search: search,
  };
}

var _config;
module.exports = {
  getConfig: function() {
    if (!_config) _config = _getConfig();
    return _config;
  }
}
