const { DynamoDBClient, ScanCommand  } = require("@aws-sdk/client-dynamodb");

exports.lambdaHandler = async (event, context, callback) => {

    const dynamoDBDoc = new DynamoDBClient({region: 'us-east-2'});
    console.log(event);
    const params = {
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'transactionItem',
        FilterExpression: 'begins_with(transactionItem, :dkey)',
        ExpressionAttributeValues: {
            ':dkey': {'S': event.headers['x-api-key'] }
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
            "data": results.Items,
            "count": results.Count
        })
    });
}
