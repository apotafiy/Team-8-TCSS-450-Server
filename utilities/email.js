('use strict');
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendEmail(receiver, subject, html) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // send mail with defined transport object
  transporter.sendMail(
    {
      from: `"Team 8 👻" <${process.env.GMAIL_USER}>`, // sender address
      to: receiver, //,'sdodvntlzeuifyiuki@mrvpt.com' // 10minuteemail when testing
      subject: subject, // Subject line
      //text: message, // plain text body
      html: html,
    },
    (err, data) => {
      if (err) {
        // TODO: somehow let client know that error occurred
        // maybe throw this error and have it caught elsewhere?
        console.error(err);
      } else {
        // TODO: let client know 'Confirmation email sent to fake@email.com'
      }
    }
  );
}

module.exports = {
  sendEmail,
};
