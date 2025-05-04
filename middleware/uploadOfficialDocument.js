
// 📂 middleware/uploadOfficialDocument.js
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
const officialStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/official/'),
  filename: (req, file, cb) =>
    cb(null, `${req.params.id}-official-${Date.now()}${path.extname(file.originalname)}`)
});

const uploadOfficialDocument = multer({ storage: officialStorage, fileFilter: pdfFilter });

module.exports = uploadOfficialDocument;

/*
const multer = require('multer');
const path = require('path');
const officialStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/official/'),
    filename: (req, file, cb) => cb(null, `${req.params.id}-official-${Date.now()}${path.extname(file.originalname)}`)
  });
  
  const uploadOfficialDocument = multer({ storage: officialStorage, fileFilter: pdfFilter });
  module.exports = uploadOfficialDocument;*/
/*const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/officialDocuments/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-official-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const uploadOfficialDocument = multer({ storage, fileFilter });

module.exports = uploadOfficialDocument;*/
