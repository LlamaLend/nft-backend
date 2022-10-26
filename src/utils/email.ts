import AWS from 'aws-sdk';

export function sendEmail(emailTo: string, subject: string, body: string) {
    // Create sendEmail params 
    var params = {
        Destination: { /* required */
            ToAddresses: [
                emailTo
            ]
        },
        Message: { /* required */
            Body: { /* required */
            /*
                Html: {
                    Charset: "UTF-8",
                    Data: "HTML_FORMAT_BODY"
                },*/
                Text: {
                    Charset: "UTF-8",
                    Data: body
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: 'sbf@llamalend.com', /* required */
    };

    // Create the promise and SES service object
    return new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
}