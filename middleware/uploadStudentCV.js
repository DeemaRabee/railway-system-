
const multer = require('multer');
const path = require('path');
const studentCVStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/cvs/'),
    filename: (req, file, cb) => cb(null, `${req.user.id}-cv-${Date.now()}${path.extname(file.originalname)}`)
  });
  
  const documentFilter = (req, file, cb) => {
    if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOC, or DOCX files are allowed'), false);
  };
  
  const uploadStudentCV = multer({ storage: studentCVStorage, fileFilter: documentFilter });
  module.exports = uploadStudentCV;
  
  

