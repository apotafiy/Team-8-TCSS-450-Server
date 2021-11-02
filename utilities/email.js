('use strict');
const nodemailer = require('nodemailer');

//----------------------------------------------------------------

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // TODO: if run into issues authenticating with Gmail, then may need to change Gmail settings to make it less secure
  // TODO: allow insecure apps to access your Gmail
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    // TODO: create burner gmail and store as .env variable
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER, // email address? or something else? like fake@email.com?
      pass: process.env.GMAIL_PASS,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Team 8 👻" <foo@example.com>', // sender address
    to: '', // 10minuteemail
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<h1>I am a header.</h1><b>Hello world?</b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

//main().catch(console.error);
//--------------------------------------------------------------

let sendEmail = (sender, receiver, subject, message) => {
  //research nodemailer for sending email from node.
  // https://nodemailer.com/about/
  // https://www.w3schools.com/nodejs/nodejs_email.asp
  //create a burner gmail account
  //make sure you add the password to the environmental variables
  //similar to the DATABASE_URL and PHISH_DOT_NET_KEY (later section of the lab)

  //fake sending an email for now. Post a message to logs.
  console.log('*********************************************************');
  console.log('To: ' + receiver);
  console.log('From: ' + sender);
  console.log('Subject: ' + subject);
  console.log('_________________________________________________________');
  console.log(message);
  console.log('*********************************************************');
};

module.exports = {
  sendEmail,
};
