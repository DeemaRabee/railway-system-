
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.get("/favicon.ico", (req, res) => res.status(204));

// Enable CORS for all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Dynamic CSP based on environment
const imgSources = [
  "'self'",
  "data:", // allow base64 (optional)
  "http://localhost:5000", // for dev
  "https://railway-system-production-1a43.up.railway.app", // production
];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: imgSources,
        connectSrc: ["'self'", "http://localhost:5000"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable this for now to simplify CORS handling
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images from other origins
  })
);

// Logging for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 50, 
  windowMs: 2 * 60 * 1000, 
  message: 'Too many requests from this IP, please try again in 2 minutes!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));

//  Serve uploaded images statically
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cache-Control", "public, max-age=0");
    },
  })
);

// Sanitize data
app.use(mongoSanitize());
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
