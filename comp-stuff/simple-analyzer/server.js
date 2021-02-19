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
    console.log('Running Simple Analyzer Cron Job');
    const tickers = ['BTC', 'ETH', 'LTC', 'BCH', 'LINK', 'XLM', 'USDC', 'UNI', 'WBTC', 'AAVE', 'ATOM', 'EOS', 'XTZ',
        'SNX', 'GRT', 'DASH', 'MKR', 'FIL', 'ALGO', 'COMP', 'DAI', 'ZEC', 'ETC', 'YFI', 'UMA', 'ZRX', 'REN', 'OMG',
        'LRC', 'BAT', 'CGLD', 'MANA', 'BNT', 'KNC', 'BAND', 'REP', 'CVC', 'BAL', 'NU', 'OXT', 'DNT', 'NMR'];

    tickers.forEach(ticker => {
        console.log('Getting ticker - ' + ticker);
        getTickerData(ticker).then(data => {
            filterForDataOnly(data).then(filtered => {
                analyzeData(filtered).then(createPosition => {
                    if(createPosition) {
                        createPosition(ticker);
                    }
                })
            });
        });
    });

});

function getBalance() {
    return new Promise((resolve, reject) => {
        http.get('http://wallet/balance', response => {
            let data = '';
            console.log('Getting balance from wallet');
            response.on('data', (chunk) => {
                data += chunk;
            })

            response.on('end', () => {
                let amount = JSON.parse(data);
                console.log('Amount: ' + amount);
                resolve(amount);
            });
        }).on("error", (err) => {
            console.log(err.message);
            reject(err.message);
        });
    });
}

function removeFundsFromWallet(funds) {
    return new Promise((resolve, reject) => {
        http.get('http://wallet/subtract/' + funds, response => {
            let data = '';
            console.log('Removing funds from wallet: ' + funds);
            response.on('data', (chunk) => {
                data += chunk;
            })

            response.on('end', () => {
                resolve(true);
            });
        }).on("error", (err) => {
            console.log(err.message);
            reject(err.message);
        });
    });
}

function createPosition(symbol, price) {
    console.log('Checking for new position on ' + symbol);
    const standardBuyAmount = 100;

    getTickerData().then(balance => {
        if(balance > standardBuyAmount) {
            //Buy position if you have funds
            removeFundsFromWallet(100).then(fundsRemoved => {
                console.log('Funds Removed :' + fundsRemoved)
                if(fundsRemoved) {
                    //ADD POSITION

                    let newPosition = {
                        'symbol': symbol,
                        'quantity': standardBuyAmount / price,
                        'amount': standardBuyAmount,
                        'quitPositionPrice': price - (price * .05),
                        'updatePositionPrice': price + (price * .03)
                    }
                }
            })
        } else {
            console.log('Not enough funds to buy more')
        }
    })
}

//SIMPLE Lets just look at last 3 points and if current is higher then both we return true.
function analyzeData(data) {
    console.log('analyzeData');
    return new Promise(resolve => {
       if(parseFloat(data[0].price) > parseFloat(data[1].price) && parseFloat(data[0].price) > parseFloat(data[2].price)) {
           resolve(true);
       } else {
           resolve(false);
       }
    });
}

function filterForDataOnly(data) {
    console.log('filterForDataOnly');
    return new Promise(resolve => {
        let temp = []
        data.forEach(node => {
            if(node.price) {
                temp.push(node);
            }
        })

        resolve(temp);
    })
}

function getTickerData(ticker) {
    return new Promise(resolve => {
        influx.query(`select * from symbol where ticker = ${Influx.escape.stringLit(ticker)} order by time desc limit 10`)
            .then( result => {
                resolve(result);
            })
            .catch( error => console.log(error));
    })
}

app.listen(3000);
