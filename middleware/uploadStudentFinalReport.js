
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

