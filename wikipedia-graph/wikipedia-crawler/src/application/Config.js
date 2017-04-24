const { omit, defaults, template, partial } = require("lodash")
const path = require("path")

const { isRequireString } = require("../lib/Validation")

const projectRoot = path.resolve(__dirname, '../')

function _getDefaults() {
    return {}
}

function _createConfig(logger) {
    logger("create application config")

    const uriTemplate = isRequireString(process.env.TARGET_URI_TEMPLATE)
    const termsFile = `${projectRoot}/resources/${isRequireString(process.env.TARGET_TERMS_FILE)}`
    const lang = isRequireString(process.env.TARGET_TERMS_LAND)
    const trackingIds = isRequireString(process.env.TRACKING_IDS)
    const exportURI = isRequireString(process.env.EXPORT_URI)

    logger("successfully validated external config")

    return {
        lang: lang,
        uriTemplate: uriTemplate,
        termsFile: termsFile,
        trackingIds: JSON.parse(trackingIds),
        exportURI: exportURI,
        concurrency: Math.min(Math.max(0, +process.env.CONCURRENCY), 10)
    }
}

let _config
module.exports = {
    getConfig (logger) {
        if (!_config) {
            _config = defaults(_createConfig(logger), _getDefaults())
            logger(omit(_config, ["security"]))
        }
        return _config
    }
}
