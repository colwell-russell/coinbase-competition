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



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
