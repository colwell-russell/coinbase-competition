'use strict';

const https = require('http');
const cron = require('node-cron');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://mongo';

// Database Name
const dbName = 'positions';

cron.schedule('* * * * *', function() {
    console.log('---------------------');
    console.log('Running Position Tracking Cron Job');
    MongoClient.connect(url, function(err, client) {
        if(err) {
            console.log('Connection Error');
            console.log(err);
        }
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        db.collection('colwell_positions').find({"status": "ACTIVE"}).toArray( (err, docs) => {
            if(err){
                console.log(err);
            }
            console.log(docs);
        });
        client.close();
    });
});

