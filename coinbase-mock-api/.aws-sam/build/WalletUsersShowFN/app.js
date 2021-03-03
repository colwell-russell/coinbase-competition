const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

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

    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        KeyConditionExpression: 'id = :dkey',
        ExpressionAttributeValues: {
            ':dkey': {'S': event.uuid }
        }
    }

    console.log(params);
    const results = await dynamoDBDoc.send(new QueryCommand(params));
    callback(null, {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify({
            "data": results.Items
        })
    });
};
