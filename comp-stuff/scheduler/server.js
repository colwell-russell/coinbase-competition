'use strict';

const express = require('express');
const https = require('https')
const cron = require('node-cron');
const Influx = require('influx');
const influx = new Influx.InfluxDB({
    host: 'influxdb',
    database: 'symbols_db',
    schema: [
        {
            measurement: 'symbol',
            fields: { price: Influx.FieldType.FLOAT },
            tags: ['ticker']
        }
    ]
});

const app = express();

// Backup a database at 11:59 PM every day.
cron.schedule('* * * * *', function() {
    console.log('---------------------');
    console.log('Running Cron Job');
    const verifyDB = async() => {await verifyDbExists()};
    verifyDB();
    const addSymbol = async() => {await addSymbolToSeries('BTC', 30.33)};
    addSymbol();
    influx.query(`select * from "symbol" where "ticker" = 'BTC' order by time desc limit 10`)
        .then( result => {
            console.log(result);
            result.groupsTagsKeys.forEach(row => {
                console.log(row);
            })
        })
        .catch( error => console.log(error));
});

async function verifyDbExists() {
    return new Promise((resolve, reject) => {
        influx.getDatabaseNames()
            .then(names => {
                console.log(names);
                if (!names.includes('symbols_db')) {
                    influx.createDatabase('symbols_db').then(result => {
                        console.log(result);
                        resolve(result);
                    });
                }
            });
    });
}

async function addSymbolToSeries(ticker, price) {
    return new Promise((resolve, reject) => {
        influx.writePoints([
            {
                measurement: 'symbol',
                tags: { ticker: ticker },
                fields: { price: price }
            }
        ]).then(() => {
            resolve('SUCCESS');
        }).catch(err => {
            console.log(err);
        })
    });
}

async function getBuyPrice(symbol) {
    return new Promise((resolve, reject) => {
        resolve(20.333);
    })
}

app.listen(3000);
