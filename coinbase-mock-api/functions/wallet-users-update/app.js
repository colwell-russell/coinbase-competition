const { DynamoDBClient, ScanCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");

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
    const body = JSON.parse(event.body);
    console.log(body);
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        KeyConditionExpression: 'id',
        FilterExpression: 'apiKey = :dkey',
        ExpressionAttributeValues: {
            ':dkey': {'S': event.headers['CB-ACCESS-KEY'] }
        }
    }
    console.log(params);
    const user = await dynamoDBDoc.send(new ScanCommand(params));

    const name = (body.name) ? body.name : user.Items[0].name.S;
    const username = (body.username) ? body.username : user.Items[0].username.S;
    const profile_location = (body.profile_location) ? body.profile_location : user.Items[0].profile_location.S;
    const profile_bio = (body.profile_bio) ? body.profile_bio : user.Items[0].profile_bio.S;
    const profile_url = (body.profile_url) ? body.profile_url : user.Items[0].profile_url.S;
    const avatar_url = (body.avatar_url) ? body.avatar_url : user.Items[0].avatar_url.S;
    const resource = (body.resource) ? body.resource : user.Items[0].resource.S;
    const resource_path = (body.resource_path) ? body.resource_path : user.Items[0].resource_path.S;

    const updateParams = {
        TableName: process.env.USERS_TABLE_NAME,
        KeyConditionExpression: "id=:id",
        UpdateExpression: "set name=" + name +", username=" + username + ", profile_location=" + profile_location + ", " +
            "profile_bio=" + profile_bio + ", profile_url=" + profile_url + ", avatar_url=" + avatar_url + ", resource=" + resource + ", " +
            "resource_path=" + resource_path,
        ExpressionAttributeValues: {
            ":id": {'S': user.Items[0].id.S }
        },
        ReturnValues:"UPDATED_NEW"
    }
    console.log(updateParams);
    let results = await dynamoDBDoc.send(new QueryCommand(updateParams));
    console.log(results);
    return {
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
    };
};
