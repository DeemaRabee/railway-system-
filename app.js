/*const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const path = require('path');


app.get('/favicon.ico', (req, res) => res.status(204));

// تمكين CORS
app.use(cors());

// تعيين رؤوس HTTP الآمنة
app.use(helmet());

// تسجيل التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// تحديد الطلبات من نفس عنوان IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 ساعة
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// قارئ محتوى الطلب، قراءة البيانات من الجسم إلى req.body
app.use(express.json({ limit: '10kb' }));

// تطهير البيانات ضد حقن استعلامات NoSQL
app.use(mongoSanitize());

// تطهير البيانات ضد هجمات XSS
app.use(xss());

// منع تلوث المعلمات
app.use(hpp({
  whitelist: ['duration', 'startDate', 'endDate', 'department'] // إضافة الحقول التي يمكن تكرارها
}));

// المسارات
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/department-heads', require('./routes/departmentHeadRoutes'));
app.use('/api/training-posts', require('./routes/trainingPostRoutes'));

// مسار الجذر
app.get('/', (req, res) => {
  res.send('API is running');
});

// معالجة المسارات غير المحددة
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// معالج الأخطاء العام
app.use(errorHandler);

module.exports = app;*/

//كود تعديل اخر نسخه

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const path = require("path"); // ✨ تمت الإضافة
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.get("/favicon.ico", (req, res) => res.status(204));

// Enable CORS for all origins or specify allowed origins
app.use(
  cors({
    origin: "*", // Adjust this to allow specific origins (e.g., 'http://localhost:3000')
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Secure HTTP headers using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "https://railway-system-production-1a43.up.railway.app",
        ], // Allow image domain
        connectSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  })
);

// Logging for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting for API requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser to read request bodies
app.use(express.json({ limit: "10kb" }));

// Serve static files (uploads directory for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sanitize data to prevent NoSQL injections
app.use(mongoSanitize());

// Protect against XSS attacks
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ["duration", "startDate", "endDate", "department"],
  })
);

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/department-heads", require("./routes/departmentHeadRoutes"));
app.use("/api/training-posts", require("./routes/trainingPostRoutes"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Handle undefined routes
app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

// General error handler
app.use(errorHandler);

module.exports = app;
