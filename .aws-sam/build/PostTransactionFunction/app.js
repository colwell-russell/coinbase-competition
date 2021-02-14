const AWS = require('aws-sdk');

exports.lambdaHandler = async (event, context, callback) => {

    AWS.config.update({region: 'us-east-2'});
    const dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    console.log(event);
    console.log(context);

    const transactionDate = new Date();
    const body = JSON.parse(event.body);
    const params = {
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
            'transactionItem': {S: event.headers['x-api-key'] + '-' + transactionDate.getTime()},
            'transaction-ticker': {S: body.symbol },
            'transaction-type': {S: body.type },
            'transaction-shares': {N: body.shares },
            'transaction-price': {N: body.price}
        }
    }

    console.log(params);
    let results = await saveTransaction(params);
    return results;

    async function saveTransaction(params) {
        return new Promise((resolve, reject) => {
            dynamoDB.putItem(params, function(err, data) {
                console.log(err);
                console.log(data);
                if(err) {
                    console.log(err);
                    resolve({
                        "isBase64Encoded": false,
                        "statusCode": 500,
                        "headers": {
                            "Access-Control-Allow-Origin": "*"
                        },
                        "body": err.toString() });
                }  else {
                    console.log(data);
                    resolve({
                        "isBase64Encoded": false,
                        "statusCode": 200,
                        "headers": {
                            "Access-Control-Allow-Origin": "*"
                        },
                        "body": JSON.stringify({
                            'transactionItem': {S: event.headers['x-api-key'] + '-' + transactionDate.getTime()},
                            'transaction-ticker': {S: body.symbol },
                            'transaction-type': {S: body.type },
                            'transaction-shares': {N: body.shares },
                            'transaction-price': {N: body.price}
                        })
                    });
                }
            });
        });
    }
}
