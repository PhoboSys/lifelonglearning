const fs = require("fs")
const readline = require("readline")
const debug = require('debug')("scanner:utils")

function readLines (filename, online) {
    readline.createInterface({
        input: fs.createReadStream(filename),
        terminal: false
    }).on('line', online)
}

function readRandomLines (filename, online) {
    readline.createInterface({
        input: fs.createReadStream(filename),
        terminal: false
    }).on('line', (line) => {
        if (Math.random() > 0.5) {
            debug(line)
            online(line)
        }
    })
}

module.exports = {
    readLines,
    readRandomLines
}
