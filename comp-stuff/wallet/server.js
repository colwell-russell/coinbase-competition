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
    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, client) {
        if(err) {
            console.log('Connection Error');
            console.log(err);
        }
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        db.collection('documents').find({}).toArray(function(error, documents) {
            if (err){
                console.log(err);
            }

            console.log(documents);
            res.send(documents);
        });

        client.close();
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
