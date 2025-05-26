
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');

const uploadStudentCV = require('../middleware/uploadStudentCV');
const uploadStudentFinalReport = require('../middleware/uploadStudentFinalReport');
const {
  getAvailablePosts,
  applyForTraining,
  getStudentApplications,
  selectApplication,
  submitFinalReport
} = require('../controllers/studentController');

const router = express.Router();

// —————————————————————————
// ✅ حماية جميع المسارات
router.use(protect);
router.use(restrictTo('student'));

// —————————————————————————
// ✅ مسارات الطالب

// ➡️ الحصول على بوستات التدريب المتاحة
router.get('/posts', getAvailablePosts);

// ➡️ التقديم على بوست تدريب مع رفع CV
router.post('/posts/:id/apply', uploadStudentCV.single('cv'), applyForTraining);

// ➡️ عرض جميع طلبات الطالب
router.get('/applications', getStudentApplications);

// ➡️ اختيار طلب معين
router.put('/applications/:id/select', selectApplication);

// ➡️ رفع تقرير التدريب النهائي
router.post('/training/report', uploadStudentFinalReport.single('finalReport'), submitFinalReport);

// —————————————————————————

module.exports = router;


