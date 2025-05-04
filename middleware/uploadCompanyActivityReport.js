// 📂 middleware/uploadCompanyActivityReport.js

const multer = require('multer');
const path = require('path');

const activityStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/activities/'),
  filename: (req, file, cb) => cb(null, `${req.params.id}-activity-${Date.now()}${path.extname(file.originalname)}`)
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const uploadCompanyActivityReport = multer({ storage: activityStorage, fileFilter: pdfFilter });
module.exports = uploadCompanyActivityReport;

/*const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/activities/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-activity-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const uploadCompanyActivityReport = multer({ storage, fileFilter });

module.exports = uploadCompanyActivityReport;*/
