#!/bin/env node

const _ = require('lodash')
const cluster = require('cluster')
const numCPUs = require("os").cpus().length

const UserAgentsList = require("../lib/UserAgentsList")
const WikiScanner = require('../lib/WikiScanner')
const { readRandomLines } = require('../lib/FSUtils')

// NOTE: this allows server utilize all core of the machine
if (cluster.isMaster) {
    const configProvider = require('../application/Config')
    const debug = require('debug')('scanner:master')
    const config = configProvider.getConfig(debug)
    for (let i = 0; i < (config.concurrency || numCPUs); i++) {
        cluster.fork();
    }

    cluster.on("exit", function() {
        cluster.fork();
    });
} else {
    const configProvider = require('../application/Config')
    const debug = require('debug')(`scanner:worke:${cluster.worker.id}`)
    const config = configProvider.getConfig(debug)
    debug("starting scanner!")
    const scanner = new WikiScanner(
        config.uriTemplate,
        config.lang,
        UserAgentsList)
    readRandomLines(
        config.termsFile,
        scanner.run.bind(scanner))
}
