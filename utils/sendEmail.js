// // 📂 utils/sendEmail.js

// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   // إنشاء ترانسبورتر (أداة الإرسال)
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,     // اسم المضيف (مثل smtp.gmail.com)
//     port: process.env.EMAIL_PORT,     // المنفذ (عادة 587 أو 465)
//     secure: process.env.EMAIL_PORT == 465, // true لـ 465، false للباقي
//     auth: {
//       user: process.env.EMAIL_USER,    // بريد المرسل
//       pass: process.env.EMAIL_PASS     // كلمة مرور التطبيق أو كلمة المرور
//     }
//   });

//   // تفاصيل الرسالة
//   const message = {
//     from: `"Training System" <${process.env.EMAIL_USER}>`,  // اسم المرسل والبريد
//     to: options.email,                                       // بريد المستلم
//     subject: options.subject,                               // عنوان الإيميل
//     text: options.message                                   // نص الرسالة
//   };

//   // إرسال الإيميل
//   await transporter.sendMail(message);
// };

// module.exports = sendEmail;

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
    from: '"Your App Name" <your@email.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
