'use strict';

const express = require('express');
const https = require('https');
const mysqlx = require('@mysql/xdevapi');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const config = {
    password: 'example',
    user: 'root',
    host: 'mysql',
    port: 33060,
    schema: 'coinbase_wallet'
};

mysqlx.getSession(config)
    .then(session => {
        console.log(session.inspect()); // { user: 'root', host: 'localhost', port: 33060 }
    }).catch(error => {
        console.log(error);
    });

// App
const app = express();
app.get('/add/:amount', (req, res) => {
    console.log('Checking for amount' + req.params.symbol);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
