'use strict';

const http = require('http');
const cron = require('node-cron');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://mongo';

// Database Name
const dbName = 'positions';

cron.schedule('* * * * *', function() {
    console.log('---------------------');
    console.log('Running Position Tracking Cron Job');

    getPositions().then(positions => {
        for (let x in positions) {
            let position = positions[x];
            console.log(position);
            getSellPrice(position.symbol).then(sellPrice => {
                console.log('Sell Price:' + sellPrice);

                if(sellPrice < parseFloat(position.quitPositionPrice)) {
                    let addFunds = sellPrice * parseFloat(position.quantity);
                    addFundsToWallet(addFunds).then(result => {
                        if(result) {
                            position.quantity = 0;
                            position.status = 'INACTIVE';
                            position.history.push({
                                type: 'SELL',
                                quantity: position.quantity,
                                amount: addFunds
                            })

                            updateDocument(position).then(result => {
                                console.log('Update Saved');
                            });
                        }
                    }).catch(error => {
                        console.log('Error doing full sell: ' + error);
                    })
                }

                if(sellPrice > parseFloat(position.updatePositionPrice)) {
                    getNewUpdateSellPercentage(position['update-sell-percentage'] ).then(updateSellPercentage => {
                        let sellQuantity = position.quantity * (parseInt(position['update-sell-percentage'] ) / 100);
                        let addFunds = sellPrice * sellQuantity;

                        addFundsToWallet(addFunds).then(result => {
                            if(result){
                                position.quantity = position.quantity - sellQuantity;
                                position.updatePositionPrice =  parseFloat(position.updatePositionPrice) + (parseFloat(position.updatePositionPrice) * .03);
                                position['update-sell-percentage'] =  updateSellPercentage;
                                position.history.push({
                                    type: 'SELL',
                                    quantity: sellQuantity,
                                    amount: addFunds
                                })

                                updateDocument(position).then(result => {
                                    console.log('Update Saved');
                                });
                            }
                        }).catch(error => {
                            console.log('Error doing partial sell: ' + error);
                        })
                    });
                }
            });
        }
    });
        //
        //         if(sellPrice > parseFloat(doc.updatePositionPrice)) {
        //             getNewUpdateSellPercentage(doc['update-sell-percentage'] ).then(updateSellPercentage => {
        //                 let sellQuantity = doc.quantity * (parseInt(doc['update-sell-percentage'] ) / 100);
        //                 let addFunds = sellPrice * sellQuantity;
        //
        //                 addFundsToWallet(addFunds).then(result => {
        //                     if(result){
        //                         doc.quantity = doc.quantity - sellQuantity;
        //                         doc.updatePositionPrice =  parseFloat(doc.updatePositionPrice) + (parseFloat(doc.updatePositionPrice) * .03);
        //                         doc['update-sell-percentage'] =  updateSellPercentage;
        //                         doc.history.push({
        //                             type: 'SELL',
        //                             quantity: sellQuantity,
        //                             amount: addFunds
        //                         })
        //
        //                         updateDocument(doc).then(result => {
        //                             console.log('Update Saved');
        //                         });
        //                     }
        //                 }).catch(error => {
        //                     console.log('Error doing partial sell');
        //                 })
        //             });
        //         }
        //     });
        // });
});

function getPositions() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, client) {
            if (err) {
                console.log('Connection Error');
                console.log(err);
            }
            console.log("Connected successfully to server");

            const db = client.db(dbName);
            console.log('Got DB');
            const cursor = db.collection('colwell_positions').find({"status": "ACTIVE"});
            cursor.toArray(function (err, docs) {
                resolve(docs);
                client.close();
            });
        });
    })
}

function getSellPrice(symbol) {
    return new Promise((resolve, reject) => {
        http.get("http://get-sell-price:8080/" + symbol, (response) => {
            let data = '';
            console.log('Calling get-sell-price for ' + symbol);
            response.on('data', (chunk) => {
                data += chunk;
            })

            response.on('end', () => {
                let jsonData = JSON.parse(data);
                const amount = jsonData.data.amount;
                console.log('Get sell price data: ' + data);
                resolve(amount);
            });
        }).on("error", (err) => {
            console.log(err.message);
            reject(err.message);
        });
    })
}

function getNewUpdateSellPercentage(currentPercentage) {
    return new Promise(resolve => {
        if(currentPercentage === 10) {
            resolve(50);
        }

        if(currentPercentage === 50) {
            resolve(100);
        }
    })
}

function addFundsToWallet(funds) {
    console.log('addFundsToWallet: ' + funds);
    return new Promise((resolve, reject) => {
        http.get('http://wallet:8080/add/' + funds, response => {
            let data = '';
            console.log('Adding funds to wallet: ' + funds);
            response.on('data', (chunk) => {
                console.log(chunk);
                data += chunk;
            })

            response.on('end', () => {
                console.log('Add funds data: ' + data);
                resolve(true);
            });
        }).on("error", (err) => {
            console.log('Error adding FUNDS: ' + err.message);
            reject(err.message);
        });
    });
}

function updateDocument(doc) {
    console.log('Update Document');
    return new Promise((resolve) => {
        MongoClient.connect(url, function(err, client) {
            if (err) {
                console.log('Connection Error');
                console.log(err);
            }
            console.log("Connected successfully to server");

            const db = client.db(dbName);
            db.collection('colwell_positions').save(doc, result => {
                resolve('SAVED');
            })
            client.close();
        });
    });
}


