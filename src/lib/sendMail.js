require('dotenv').config();

const AWS = require('aws-sdk');
const striptags = require('striptags');

const {
  AWS_SES_ACCESS_KEY_ID: awsKeyID,
  AWS_SES_SECRET_ACCESS_KEY: awsSecretKey,
  MAIL_SENDER_SUPPORT: senderSupport,
  MAIL_SENDER_TITLE: senderTitle,
  MAIL_SITE_LINK: siteLink
} = process.env;

AWS.config.update({
  accessKeyId: awsKeyID,
  secretAccessKey: awsSecretKey
});
const ses = new AWS.SES({ region: 'us-west-2' });

const sendMail = ({
  to,
  subject,
  body,
  from
}) => {
  return new Promise((resolve, reject) => {
    const params = {
      Destination: {
        ToAddresses: (() => {
          if (typeof to === 'string') {
            return [to];
          }
          return to;
        })()
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body
          },
          Text: {
            Charset: 'UTF-8',
            Data: striptags(body)
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: from
    };

    ses.sendEmail(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};


// send verification mail
module.exports.sendSignupVerification = (firstName, lastName, email, code) => {
  console.log(firstName+lastName+email+code);
  sendMail({
    to: `${email}`,
    subject: 'Email Verification',
    from: `${senderTitle} <${senderSupport}>`,
    body: `
    <div style=" background: '#eceff4'; padding: 50px 20px; color: rgb(255, 255, 255); ">
    <div style="max-width: 700px; margin: 0px auto; font-size: 14px;">
      <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px; border: 0px; background: rgb(178,36, 177);">
        <tbody>
          <tr>
            <td style="vertical-align: top;"><img src="https://s3.amazonaws.com/blocktoken.ai/assets/logo.png" alt="Blocktoken AI Platform" style="height: 40px;"></td>
            <td style="text-align: right; vertical-align: middle;"><span style="color: rgb(255, 255, 255);"></span></td>
          </tr>
        </tbody>
      </table>
      <div style="padding: 40px 40px 20px; background: rgb(255, 255, 255); border-radius: 6px; box-shadow: 0 3px 12px 0 rgba(103, 103, 103, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12); box-sizing: border-box;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; border: 0px;">
          <tbody>
            <tr>
              <td>
                <p>Dear <b>${firstName} ${lastName}</b>,</p>
                <p>You have successfully created a Blocktoken Dashboard account.</p>
                <p>Please click on the link below to verify your email address and complete your registration.</p>
                <a href="${siteLink}/confirmation/${code}"
                style="display: inline-block; padding: 11px 30px 6px; margin: 20px 0px 30px; font-size: 15px; color: rgb(255, 255, 255); background: rgb(14, 190, 74); border-radius: 5px; text-decoration: none">
                Verify your email address</a>
                <p>or copy and paste this link into your browser:</p>
                <a href="${siteLink}/confirmation/${code}" style="text-align:left; display:block;">${siteLink}/confirmation/${code}</a>
                <p>Best Regards~</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="text-align: center; font-size: 12px; color: rgb(81, 77, 106); margin-top: 20px;">
        <p>Blocktoken, The Token Automation Platform<br>Powered by Blocktoken Dashboard</p>
      </div>
    </div>
  </div>
    `
  });
};
