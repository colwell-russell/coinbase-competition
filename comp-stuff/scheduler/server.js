'use strict';

const express = require('express');
const http = require('http')
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
    console.log('Running Scheduler Cron Job');
    const tickers = ['BTC', 'ETH', 'LTC', 'BCH', 'LINK', 'XLM', 'USDC', 'UNI', 'WBTC', 'AAVE', 'ATOM', 'EOS', 'XTZ',
        'SNX', 'GRT', 'DASH', 'MKR', 'FIL', 'ALGO', 'COMP', 'DAI', 'ZEC', 'ETC', 'YFI', 'UMA', 'ZRX', 'REN', 'OMG',
        'LRC', 'BAT', 'CGLD', 'MANA', 'BNT', 'KNC', 'BAND', 'REP', 'CVC', 'BAL', 'NU', 'OXT', 'DNT', 'NMR'];

    const verifyDB = async() => {await verifyDbExists()};
    verifyDB();

    tickers.forEach(key => {
        console.log('Adding new buy price for symbol ' + key);
        getBuyPrice(key).then(price => {
            addSymbolToSeries(key, price).then(result => {
               console.log(result);
           });
       }).catch(error => {
           console.log(error);
       });
    })

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
                console.log(names)
                if (!names.includes('symbols_db')) {
                    influx.createDatabase('symbols_db').then(result => {
                        resolve(result);
                    });
                }
            });
    });
}

async function addSymbolToSeries(ticker, price) {
    return new Promise((resolve, reject) => {
        console.log('Adding ' + ticker + ' - ' + price);
        influx.writePoints([
            {
                measurement: 'symbol',
                tags: { ticker: ticker },
                fields: { price: price }
            }
        ]).then(() => {
            resolve('SUCCESS ' + ticker + ' - ' + price);
        }).catch(err => {
            console.log(err);
        })
    });
}

async function getBuyPrice(symbol) {
    return new Promise((resolve, reject) => {
        http.get("http://get-buy-price:8080/" + symbol, (response) => {
            let data = '';
            console.log('Calling get-buy-price for ' + symbol);
            response.on('data', (chunk) => {
                data += chunk;
            })

            response.on('end', () => {
                let jsonData = JSON.parse(data);
                const amount = jsonData.data.amount;
                resolve(amount);
            });
        }).on("error", (err) => {
            console.log(err.message);
            reject(err.message);
        });
    })
}

app.listen(3000);
