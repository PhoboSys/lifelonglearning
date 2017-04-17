#!/bin/env node

const _ = require('lodash')
const cluster = require('cluster');
const config = require('../application/Config')
// const Scanner = require('../application/Scanner')

// NOTE: this allows server utilize all core of the machine
if (cluster.isMaster) {
    const debug = require('debug')('scanner:master')
    exec('sudo pkill chrome && sudo pkill firefox && sudo pkill phantomjs');
    if (!config.concurrency) {
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    }

    cluster.on("exit", function() {
        cluster.fork();
    });
} else {
    console.log(cluster.worker);
    console.log(cluster.worker.id);
    const debug = require('debug')(`scanner:worke${cluster.worker}`)
    debug("start scanner!")
    // const scanner = new Scanner()
    // Scanner.run()
    // .then(
    //     () => {
    //         debug(_.toArray(arguments))
    //         process.exit(0)
    //     },
    //     (e) => {
    //         debug(e)
    //         process.exit(1);
    //     });
}
