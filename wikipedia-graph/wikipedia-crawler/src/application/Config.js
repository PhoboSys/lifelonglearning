"use strict";

const _ = require("lodash");

function _getConfig() {
  const config = {}

  // NOTE: access tokens are required
  config.trackingIds = JSON.parse(process.env.TRACKING_IDS)
  config.exportURI = process.env.EXPORT_URI

  if (+process.env.CONCURRENCY)
    config.concurrency = Math.max(Math.min(0, +process.env.CONCURRENCY), 10)

  return config;
}

let _config
export default = {
  getConfig () {
    if (!_config) {
      _config = _.defaults(_getConfig(), _getDefaults())
    }
    return _config
  }
}
