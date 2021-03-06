const crypto = require('crypto');
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context, callback) => {

    const dynamoDBDoc = new DynamoDBClient({region: 'us-east-2'});
    console.log(event);
4
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        KeyConditionExpression: 'id',
        FilterExpression: 'apiKey = :dkey',
        ExpressionAttributeValues: {
            ':dkey': {'S': event.headers['CB-ACCESS-KEY'] }
        }
    }

    console.log(params);
    const results = await dynamoDBDoc.send(new ScanCommand(params));
    console.log(results.Items);
    const message = event.headers['CB-ACCESS-TIMESTAMP'] + event.method + event.path + '';
    const hash = crypto.createHmac('SHA256', results.Items[0].private_key.S).update(message).digest('base64');

    console.log('Message: ' + message);
    console.log('HASH: ' + hash);
    console.log('SIGNATURE: ' +  event.headers['CB-ACCESS-SIGN']);

    const policy = {
        "principalId": event.requestContext.accountId, // The principal user identification associated with the token sent by the client.
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Allow",
                    "Resource": event.methodArn
                }
            ]
        },
        "context": {
            "stringKey": "value",
            "numberKey": "1",
            "booleanKey": "true"
        },
        "usageIdentifierKey": event.headers['CB-ACCESS-KEY']
    }

    callback(null, policy);
};
