// 📂 server.js

const dotenv = require('dotenv');
dotenv.config();

// معالجة الاستثناءات غير المعالجة
process.on('uncaughtException', (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const { connectDB, closeDB } = require('./config/db');

// الاتصال بقاعدة البيانات
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// معالجة رفض الوعود غير المعالجة
process.on('unhandledRejection', (err) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(async () => {
    console.log('🛑 Closing server...');
    await closeDB(); // ✨ إغلاق الاتصال مع قاعدة البيانات
    process.exit(1);
  });
});

/*const dotenv = require('dotenv');
dotenv.config();

// معالجة الاستثناءات غير المعالجة
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const { connectDB, closeDB } = require('./config/db');  // استيراد الدوال بشكل صحيح

// الاتصال بقاعدة البيانات
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// معالجة رفض الوعود غير المعالجة
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
*/