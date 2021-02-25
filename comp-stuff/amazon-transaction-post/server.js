'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const domain = 'qlblt8yqzh.execute-api.us-east-2.amazonaws.com';
const apiKey = 'COINBASECOMP-KEY-1-RUSS-COLWELL'

// App
const app = express();

// parse application/json
app.use(bodyParser.json())

app.post('/transaction', (req, res) => {
    const options = {
        hostname: domain,
        port: 443,
        path: '/dev/post-transaction',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept_Encoding': 'gzip,deflate,br',
            'Connection': 'keep-alive',
            'x-api-key': apiKey
        }
    }

    const requestBody = {
        type: req.body.type,
        symbol: req.body.symbol,
        shares: req.body.shares.toString(),
        price: req.body.price.toString()
    }
    console.log(requestBody);
    let data = '';
    const request = https.request(options, (response) => {
        console.log(`statusCode: ${response.statusCode}`);

        response.on('data', (chunk) => {
            console.log(chunk);
            data += chunk;
        });

        response.on('end', data => {
            console.log('DATA: ' + data);
            res.send({status: 'SUCCESS'})
        })

        response.on('error', error => {
            console.log('Error' + error);
        })
    });

    request.write(JSON.stringify(requestBody));
    request.end();
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
