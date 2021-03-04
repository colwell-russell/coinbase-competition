const uuidv4 = require('uuid');
const AWS = require('aws-sdk');

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
exports.lambdaHandler = async (event, context) => {
    AWS.config.update({region: 'us-east-2'});
    const dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    const body = JSON.parse(event.body);
    const uuid = uuidv4.v4();
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Item: {
            'id': {S: uuid},
            'name': {S: body.name },
            'username': {S: body.username },
            'profile_location': {S: 'null' },
            'profile_bio': {S: 'null'},
            'profile_url': {S: 'https://' + event.requestContext.apiId + '/' + body.username},
            'avatar_url': {S: 'null'},
            'resource': {S: 'user'},
            'resource_path': {S: 'v2/user/' + uuid}
        }
    }


    let results = await saveTransaction(params);
    return results;

    async function saveTransaction(params) {
        return new Promise((resolve, reject) => {
            dynamoDB.putItem(params, function(err, data) {
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
                    resolve({
                        "isBase64Encoded": false,
                        "statusCode": 200,
                        "headers": {
                            "Access-Control-Allow-Origin": "*"
                        },
                        "body": JSON.stringify({
                            'id': uuid,
                            'name': body.name,
                            'username': body.username,
                            'profile_location': 'null' ,
                            'profile_bio': 'null',
                            'profile_url': 'https://' + event.requestContext.apiId  + '/' + body.username,
                            'avatar_url': 'null',
                            'resource': 'user',
                            'resource_path': 'v2/user/' + uuid
                        })
                    });
                }
            });
        });
    }
};
