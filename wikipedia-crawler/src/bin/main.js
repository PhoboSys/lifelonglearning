#!/bin/env node

const _ = require('lodash')
const cluster = require('cluster')
const numCPUs = require("os").cpus().length;

const GraphStorage = require("../lib/GraphStorage.js");

const UserAgentsList = require("../lib/UserAgentsList");
const WikiScanner = require('../lib/WikiScanner');
const { readLines } = require('../lib/FSUtils');

// NOTE: this allows server utilize all core of the machine
// NOTE: disable for dev
/* if (cluster.isMaster) {
    const configProvider = require('../application/Config')
    const debug = require('debug')('scanner:master')
    const config = configProvider.getConfig(debug)
    for (let i = 0; i < (config.concurrency || numCPUs); i++) {
        cluster.fork();
    }

    cluster.on("exit", function() {
        cluster.fork();
    });
} else {*/
    const configProvider = require('../application/Config');
    const debug = require('debug') (`scanner: `) //(`scanner:worke:${cluster.worker.id}`)
    const config = configProvider.getConfig(debug);

    new GraphStorage()
        .connect()
        .then((storage) => {
            const scanner = new WikiScanner(
                config.uriTemplate,
                config.lang,
                UserAgentsList,
                storage);
    
            debug("starting scanner!");
    
            let step = Math.floor(Math.random() * 6);
            crawl(scanner, 0);
    		

            setInterval(() => {
                crawl(scanner, step+=Math.floor(Math.random() * 10));
            }, 20*1000);
        })
        .catch((e) => {
            debug(e);
        });
    
    function crawl(scanner, step) {
        let limit = Math.floor(Math.random() * 7);
        readLines(config.termsFile, limit, step).then(terms => {
            _.forEach(terms, line => {
                scanner.run(line)
            })
        });
    }
    
    
//}
