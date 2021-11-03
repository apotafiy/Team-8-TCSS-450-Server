('use strict');
require('dotenv').config();
const nodemailer = require('nodemailer');

//----------------------------------------------------------------

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(
  receiver,
  subject,
  message,
  html,
  callback /** Maybe maybe not. For dealing with error or success */
) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER, // like fake@email.com
      pass: process.env.GMAIL_PASS,
    },
  });

  // send mail with defined transport object
  //let info = await
  transporter.sendMail(
    {
      from: `"Team 8 👻" <${process.env.GMAIL_USER}>`, // sender address
      to: receiver, //,'sdodvntlzeuifyiuki@mrvpt.com' // 10minuteemail when testing
      subject: subject, // Subject line
      text: message, // plain text body
      html: html,
    },
    (err, data) => {
      // 'data' arg has a lot of same attributes as 'info' variable
      if (err) {
        // TODO: somehow let client know that error occurred
        // maybe throw this error and have it caught elsewhere?
        console.error(err);
      } else {
        // TODO: let client know 'Confirmation email sent to fake@email.com'
        //console.log('Message sent: %s', data.messageId);
      }
    }
  );

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

//sendEmail('apoy@gmail.com', 'This is the subect', 'Hellooo wooorrrllldd!!');
module.exports = {
  sendEmail,
};
