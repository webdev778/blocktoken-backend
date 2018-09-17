const AWS = require('aws-sdk');

const {
  AWS_ACCESS_KEY_ID: awsKeyID,
  AWS_SECRET_ACCESS_KEY: awsSecretKey,
  // MAIL_SENDER_SUPPORT: senderSupport,
  // MAIL_SENDER_SALES: senderSales,
  // MAIL_SENDER_BILLING: senderBilling,
  // MAIL_SENDER_NOTIFICATIONS: senderNotifications,
  // MAIL_SENDER_TITLE: senderTitle,
  // MAIL_SITE_LINK: siteLink
} = process.env;

AWS.config.update({
  accessKeyId: awsKeyID,
  secretAccessKey: awsSecretKey
});
const ses = new AWS.SES({ region: 'us-west-2' });

const params = {
  Destination: {
    ToAddresses: ['akira20170313@gmail.com']
  },
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data:
          'This message body contains HTML formatting, like <a class="ulink" href="http://docs.aws.amazon.com/ses/latest/DeveloperGuide" target="_blank">Amazon SES Developer Guide</a>.'
      },
      Text: {
        Charset: 'UTF-8',
        Data: 'This is the message body in text format.'
      }
    },
    Subject: {
      Charset: 'UTF-8',
      Data: 'Test email from code'
    
    }
  },
  Source: 'Alex <support@blocktoken.ai>'
}

ses.sendEmail(params, (err, data) => {
  if (err) console.log(err, err.stack)
  else console.log(data)
})