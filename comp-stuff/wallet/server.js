'use strict';

const express = require('express');
const https = require('https');
const MongoClient = require('mongodb').MongoClient;

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Connection URL
const url = 'mongodb://mongo';

// Database Name
const dbName = 'wallet';

// App
const app = express();
app.get('/add/:amount', (req, res) => {
    console.log('Amount: ' + req.params.amount);
    getAccountTrackingDocument().then(doc => {
        doc.transactions.push({
            type: "ADD",
            amount: req.params.amount
        })
        let updateDoc = {
            balance: doc.balance + parseFloat(req.params.amount),
            transactions: doc.transactions
        }
        updateAccountDocument(updateDoc).then(response => {
            res.send(response);
        })
    })
});

app.get('/subtract/:amount', (req, res) => {
    console.log('Amount: ' + req.params.amount);
    getAccountTrackingDocument().then(doc => {
        doc.transactions.push({
            type: "SUBTRACT",
            amount: req.params.amount
        })
        let updateDoc = {
            balance: doc.balance - parseFloat(req.params.amount),
            transactions: doc.transactions
        }
        updateAccountDocument(updateDoc).then(response => {
            res.send(response);
        })
    })
});

app.get('/balance', (req, res) => {
    getAccountTrackingDocument().then(doc => {
        res.send(doc.balance)
    })
});

app.get('/transactions', (req, res) => {
    getAccountTrackingDocument().then(doc => {
        res.send(doc.transactions)
    })
});

function getAccountTrackingDocument() {
    return new Promise((resolve, reject) => {
        // Use connect method to connect to the server
        MongoClient.connect(url, function(err, client) {
            if(err) {
                console.log('Connection Error');
                console.log(err);
            }
            console.log("Connected successfully to server");

            const db = client.db(dbName);
            db.collection('colwell_wallet').find({"name": "account_tracking"}).toArray( (err, docs) => {
                if(err){
                    console.log(err);
                }

                console.log(docs);
                resolve(docs[0]);
            });
            client.close();
        });
    });
}

function updateAccountDocument(updateDoc) {
    console.log('Update Doc');
    console.log(updateDoc);
    return new Promise(resolve => {
        MongoClient.connect(url, function(err, client) {
            if(err) {
                console.log('Connection Error');
                console.log(err);
            }
            console.log("Connected successfully to server");


            const db = client.db(dbName);
            db.collection('colwell_wallet').updateOne(
                {
                    name: 'account_tracking'
                },
                {
                    $set: updateDoc
                },
                (err, result) => {
                    console.log(result);
                    resolve(result);
                });

            client.close();
        });
    })
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
