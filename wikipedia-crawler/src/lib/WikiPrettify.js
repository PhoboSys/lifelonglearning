"use strict";

const factory = require("debug");
const debug = factory("scanner: ");
const { write } = require('../lib/FSUtils');
const configProvider = require('../application/Config');
const config = configProvider.getConfig(debug);

class WikiPrettify {
    
    constructor(document) {
        this._document = document;
    }
    
    _getNodeName() {
        const title = this._document.querySelector(".firstHeading").textContent;
        
        return title.replace(/[|&;$'%@"<>+,]/g, "");
    }
    
    _cleanUp() {
        const navigation = this._document.querySelectorAll(".navigation-not-searchable");
        if (navigation) {
            navigation.forEach(function (element) {
                element.remove();
            });
        }
    
        const thumb = this._document.querySelectorAll(".thumb");
        if (thumb) {
            thumb.forEach(function (element) {
                element.remove();
            });
        }
        
        const table = this._document.querySelectorAll("table");
        if (table) {
            table.forEach(function (element) {
                element.remove();
            });
        }
    
        const ipa = this._document.querySelectorAll(".IPA");
        if (ipa) {
            ipa.forEach(function (element) {
                element.remove();
            });
        }
    
        const coordinates = this._document.querySelectorAll("#coordinates");
        if (coordinates) {
            coordinates.forEach(function (element) {
                element.remove();
            });
        }
    
        const editSection = this._document.querySelectorAll(".mw-editsection");
        if (editSection) editSection.forEach(function(element) {
            element.remove();
        });
    
        const toc = this._document.querySelectorAll(".toc");
        if (toc) toc.forEach(function(element) {
            element.remove();
        });
    
        const references =this._document.querySelectorAll(".mw-references-wrap");
        if (references) references.forEach(function(element) {
            element.remove();
        });
    
        const reference = this._document.querySelectorAll(".reference");
        if (reference) {
            reference.forEach(function (element) {
                element.remove();
            });
        }
    
        const metadata = this._document.querySelectorAll(".metadata");
        if (metadata) {
            metadata.forEach(function (element) {
                element.remove();
            });
        }
    
        const unicode = this._document.querySelectorAll(".unicode");
        if (unicode) {
            unicode.forEach(function (element) {
                element.remove();
            });
        }
    }
    
    _removeUnusedSymbols() {
        let text = this._document.querySelector(".mw-parser-output").innerHTML;
    
        const symbols = text.split("");
        let sum = 0;
        let i = 0;
        let garbage = [];
    
        const firstBracketPosition = text.indexOf('(');
        const firstLinkPosition = text.indexOf('<a href=');
    
        while (++i <= symbols.length) {
        
            if (firstBracketPosition > firstLinkPosition) {
                break;
            }
        
            if (symbols[i] === '(') {
                garbage.push(i);
                sum += 1;
            }
        
            if (sum > 0) {
                garbage.push(i);
            }
        
            if (symbols[i] === ')') {
                garbage.push(i);
                sum -= 1;
            }
        }
    
        for (i = 0; i < garbage.length; i++) {
            delete symbols[garbage[i]];
        }
    
        this._document.body.innerHTML = symbols.join('');
    }
    
    _getTerms(node) {
        const links = this._document.links;
        const linksSize = Math.floor(links.length / 10);
    
        for (let i = 0; i <= linksSize; i++) {
            let wiki = links[i].href.indexOf('/wiki/');
            if (!links[i].hash && wiki !== -1) {
                this._saveTerm(links[i].title, node);
            }
        }
    }
    
    _saveTerm(term, node) {
        write(config.termsCollectorFile, `:$${node}$:${term}`);
    }
    
    _getLink() {
        const links = this._document.links;
        const linksSize = links.length;
        let validLink;
    
        for (let i = 0; i <= linksSize-1; i++) {
            let ogg = links[i].href.indexOf('ogg');
        
            if (!links[i].hash && ogg === -1) {
                validLink = links[i].href;
                break;
            }
        }
        
        return validLink
    }
    
    prettify() {
        this._cleanUp();
        const node = this._getNodeName();
    
        if (config.isCollect) {
            this._getTerms(node);
        }
        
        this._removeUnusedSymbols();
    
        const uri = this._getLink();
    
        return {uri, node};
    }
}

module.exports = WikiPrettify;
