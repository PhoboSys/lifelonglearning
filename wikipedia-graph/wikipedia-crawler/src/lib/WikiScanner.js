const factory = require("debug")
const request = require("request")
const url = require("url")
const { JSDOM } = require("jsdom")
const { template, endsWith } = require("lodash")

const debug = factory("scanner:scanner")

class WikiScanner {
    constructor (uriTemplate, lang, agents) {
        this._uriTemplate = uriTemplate
        this._lang = lang
        this._agents = agents
    }

    _createUri (term) {
        return template(this._uriTemplate)({
            term: term.replace(/\s/g, "_"),
            lang: this._lang
        })
    }

    _getUri (body) {
        const dom = new JSDOM(body)
        const element = dom.window.document.querySelector(".hatnote")
        if (element) element.remove()

        const anchor = dom.window.document.querySelector(
            "#mw-content-text > p > a:not([href='/wiki/Ancient_Greek'])")
        const uri = anchor && anchor.href

        if (uri) {
            const uriObj = url.parse(this._createUri(""))
            return uriObj.protocol + '//' + uriObj.hostname + uri
        }
    }

    _stop (error) {
        debug(error)
    }

    _end (result) {
        debug(result)
    }

    _scann (collector) {
        const random = Math.floor(Math.random() * this._agents.length)
        debug("Getting : " + collector.uri)
        request.get(
            {
                url: collector.uri,
                "User-Agent": this._agents[random]
            },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const uri = this._getUri(body)
                    if (endsWith(uri, "Philosophy")) {
                        this._end({ referer: collector, uri })
                    } else {
                        this._scann({ referer: collector, uri })
                    }
                } else {
                    this._stop(error || response.statusCode)
                }
            }
        )
    }

    run (term) {
        const uri = this._createUri(term)
        this._scann({ referer: "-", uri })
    }
}

module.exports = WikiScanner
