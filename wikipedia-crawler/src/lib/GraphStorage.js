"use strict";

const factory = require("debug");
const neo4j = require('neo4j-driver').v1;
const configProvider = require('../application/Config');
const debug = factory("scanner: ");
const config = configProvider.getConfig(debug);
const {invert} = require('lodash');

class GraphStorage {
    
    _reconnectCounter = 0;
    
    saveRelationship = (memory) => {
        const data = invert(memory);
        
        let i = 0;
        let query = '';
        
        while (i < Object.keys(data).length - 1) {
            
            query += ` MERGE (node${i}:Word  {id: '${data[i]}'})
                ON CREATE SET node${i}.isFromDictionary ="true"
                ON MATCH SET node${i}.isFound ="true"
                MERGE (relatedTo${i}:Word {id: '${data[i + 1]}'})
                MERGE (node${i})-[:related_to]->(relatedTo${i})`;
            i++
        }
        
        if (query) {
            this._session.run(query)
                .then(() => debug('Inserted successfully'))
                .catch((e) => {
                    debug(`Error: ${e} `);
                    
                    if (this._reconnectCounter >= 3) {
                        throw new Error('Cannot connect to NEO4J');
                    }
                    
                    debug(`Try to reconnect`);
                    
                    this._reconnectCounter++;
                    
                    this.connect();
                    this.saveRelationship(memory);
                }).catch((e) => {
                debug(`Error: ${e} `);
                procces.exit(1);
            })
        }
    };
    
    connect() {
        return new Promise((res, rej) => {
            const neo4jConnection = `bolt://${config.neo4j.uri}:${config.neo4j.port}`;
            
            const driver = new neo4j.driver(neo4jConnection, neo4j.auth.basic(config.neo4j.login, config.neo4j.password));
            this._session = driver.session();
            
            this._session.run(`MATCH (n) RETURN n limit 1`)
                .then(() => {
                    debug(`Connected successfully to NEO4J`);
                    res(this);
                })
                .catch((e) => {
                    rej(e);
                });
        })
    }
}

module.exports = GraphStorage;
