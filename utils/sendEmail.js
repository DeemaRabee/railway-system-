

const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_FROM}>`,
    to: options.email,
   subject: "Reset Your Password - Training System",
    text: options.message  


  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
