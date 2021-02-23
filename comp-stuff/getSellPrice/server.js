'use strict';

const express = require('express');
const https = require('https')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/:symbol', (req, res) => {
    console.log('Getting Sell Price for: ' + req.params.symbol)
    https.get('https://api.coinbase.com/v2/prices/' + req.params.symbol + '-USD/sell', (response) => {
        let data = '';
        console.log('making get');
        response.on('data', (chunk) => {
            console.log(chunk);
            data += chunk;
        });

        response.on('end', () => {
            console.log(JSON.parse(data));
            res.send(JSON.parse(data));
        });

    }).on("error", (err) => {
        console.log(err.message);
        res.send(err.message);
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
