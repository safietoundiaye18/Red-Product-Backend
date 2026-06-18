
const nodemailer = require('nodemailer');

const brevo = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = brevo;