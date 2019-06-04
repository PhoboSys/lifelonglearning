const fs = require("fs")
const readline = require("readline");
const debug = require('debug')("scanner:utils")

function write(filename, term) {
    fs.appendFile(filename, `\n${term}`, function (err) {
        if (err) throw err;
    });
}


function readLines (filename, limit, step) {
    return new Promise((resolve, reject) => {
        let lineCounter = 0;
        let container = [];
        
        const lineReader = readline.createInterface({
            input: fs.createReadStream(filename),
            terminal: false
        });
        
        var lineNumber = 0;
        
        lineReader.on('line', (line) => {
            
            lineNumber++;
            
            if (step <= lineNumber) {
                
                if (lineCounter <= limit) {
                    
                    if (Math.random() > 0.62) {
                        container.push(line);
                        lineCounter++;
                    }
                } else {
                    lineReader.close();
                    resolve(container);
                }
            }
        });
    });
}

module.exports = {
    write,
    readLines: readLines
};
