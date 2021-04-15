const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const config = require("../config.js");
const sendEmail = async (authEmail,verifyCode) => {
  const domain = config.DOMAIN;
  const mailServer = config.MAIL_SERVER;
  const mailPort = config.MAIL_PORT;
  const outboxEmailAddress = config.EMAIL;
  const emailPassword = config.EMMAIL_PASSWORD;

  var transporter = nodemailer.createTransport({
    host: mailServer,
    port: mailPort,
    secure: true, // true for 465, false for other ports
    auth: {
      user: outboxEmailAddress,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var handlebarsOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve(__dirname, "../templates"),
      layoutsDir: path.resolve(__dirname, "../templates"),
      defaultLayout: "publicEmail.handlebars",
    },

    viewPath: path.resolve(__dirname, "../templates"),
    extName: ".handlebars",
  };
  transporter.use("compile", hbs(handlebarsOptions));
  var mailOptions = {
    from: outboxEmailAddress, // ایمیل مبدا
    to: authEmail, // ایمیل مقصد
    bcc: "m.y.ahmadi22@gmail.com",
    template: "publicEmail",
    subject: "کد تایید ",
    context: {
      title: `Code : ${verifyCode}`,
    },

  };
  try {
    let result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

exports.sendEmail = sendEmail;
