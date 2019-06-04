"use strict";

const factory = require("debug")
const request = require("request");
const url = require("url")
const { JSDOM } = require("jsdom")
const { template, endsWith, assign } = require("lodash");
const WikiPrettify = require("../lib/WikiPrettify.js")

const debug = factory("scanner:scanner");

class WikiScanner {
    constructor(uriTemplate, lang, agents, storage) {
        this._uriTemplate = uriTemplate;
        this._lang = lang;
        this._agents = agents;
    
        this._storage = storage;
    }
    
    _getData(dom) {
        const document = dom.window.document;
        const wikiPrettify = new WikiPrettify(document);
        
        return wikiPrettify.prettify();
    }
    
    _createUri(term) {
        return template(this._uriTemplate)({
            term: term.replace(/\s/g, "_"),
            lang: this._lang
        })
    }
    
    _getUri(body, baseUri) {
        const dom = new JSDOM(body);
        
        debug("Getting : " + baseUri);
        const {uri, node} = this._getData(dom);
        let fullLink;
        
        const uriObj = url.parse(this._createUri(""));
        fullLink = uriObj.protocol + '//' + uriObj.hostname + uri;
        
        return {uri: fullLink, node: node}
    }
    
    _stop(error) {
        debug(error)
    }
    
    _end(result) {
        debug(result);
        this._storage.saveRelationship(result.memory);
    }
    
    _scann = (collector) => {
        const random = Math.floor(Math.random() * this._agents.length);
        
        request.get(
            {
                url: collector.uri,
                "User-Agent": this._agents[random]
            },
            (error, response, body) => {
                
                if (error || response.statusCode !== 200) {
                    return this._stop(error || response.statusCode);
                }
                
                try {
                    const {uri, node} = this._getUri(body, collector.uri);
                    
                    if (collector.memory.hasOwnProperty(node)) {
                        debug("Recursion detected: " + collector.uri);
                        return this._end({uri, memory: collector.memory});
                    }
                    
                    let memory = assign(collector.memory, {[node]: collector.i});
                    
                    if (endsWith(uri, "Philosophy")) {
                        memory = assign(collector.memory, {'Philosophy': collector.i += 1});
                        
                        return this._end({uri, memory, i: collector.i})
                    } else {
                        this._scann({uri, memory, i: collector.i += 1});
                    }
                } catch (e) {
                    this._stop(`Catch error: ${e}`);
                }
            })
    }
    
    
    run = (term) => {
        const valid = term.match(/\:\$([^\$\:]*)\$\:/igm);
        
        if (valid) {
            let node = valid[0].replace(/:\$|\$:/g, '');
            let uri = term.match(/\$:.+/igm)[0].replace(/\$:/g, '');
            
            this._scann({uri: this._createUri(uri), memory: {[node]: 0}, i: 1});
        } else {
            this._scann({uri: this._createUri(term), memory: {}, i: 0});
            
        }
    }
}

module.exports = WikiScanner;
