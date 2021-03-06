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

    callback(null, {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify({
            'id': results.Items[0].id.S,
            'name': results.Items[0].name.S,
            'username': results.Items[0].username.S,
            'profile_location': results.Items[0].profile_location.S,
            'profile_bio': results.Items[0].profile_bio.S,
            'profile_url': results.Items[0].profile_url.S,
            'avatar_url': results.Items[0].avatar_url.S,
            'resource': results.Items[0].resource.S,
            'resource_path': results.Items[0].resource_path.S
        })
    });
};
