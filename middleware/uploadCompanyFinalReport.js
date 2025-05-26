const multer = require('multer');
const path = require('path');

// ✅ فلتر لقبول فقط ملفات PDF
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed (PDF only).'), false);
  }
};

// ✅ إعداد تخزين ملف التقرير النهائي
const companyFinalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/finals/company/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.params.id}-company-final-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// ✅ إعداد ميدل وير رفع الملف
const uploadCompanyFinalReport = multer({
  storage: companyFinalStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // اختياري: حد الحجم 5MB
});

module.exports = uploadCompanyFinalReport;


