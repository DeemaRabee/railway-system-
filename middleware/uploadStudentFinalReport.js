// 📂 middleware/uploadStudentFinalReport.js
/*
middleware/uploadStudentFinalReport.js
const multer = require('multer');
const path = require('path');
const studentFinalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/finals/student/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-student-final-${Date.now()}${path.extname(file.originalname)}`)
});

const uploadStudentFinalReport = multer({ storage: studentFinalStorage, fileFilter });

module.exports = uploadStudentFinalReport;
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/finals/student');
  },
  filename: (req, file, cb) => {
    cb(null,  `${req.user.id}-student-final-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

uploadStudentFinalReport = multer({ storage, fileFilter });

module.exports = uploadStudentFinalReport;
*/



const multer = require('multer');
const path = require('path');

// ✅ فلترة لقبول فقط ملفات PDF
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// ✅ إعداد التخزين
const studentFinalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/finals/student/'),
  filename: (req, file, cb) =>
    cb(null, `${req.user.id}-student-final-${Date.now()}${path.extname(file.originalname)}`)
});

const uploadStudentFinalReport = multer({ storage: studentFinalStorage, fileFilter: pdfFilter });
module.exports = uploadStudentFinalReport;

/*const multer = require('multer');
const path = require('path');
const studentFinalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/finals/student/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-student-final-${Date.now()}${path.extname(file.originalname)}`)
});

const uploadStudentFinalReport = multer({ storage: studentFinalStorage, fileFilter: pdfFilter });
module.exports = uploadStudentFinalReport;*/
/*const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/finals/student');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-student-final-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const uploadStudentFinalReport = multer({ storage, fileFilter });

module.exports = uploadStudentFinalReport;*/
