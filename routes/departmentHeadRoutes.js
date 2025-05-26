
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const uploadDepartmentOfficialDocument = require('../middleware/uploadOfficialDocument'); 
const {
  getCompanies,
  getDepartmentStudents,
  getPendingApplications,
  submitOfficialDocument
} = require('../controllers/departmentHeadController');

const router = express.Router();

// —————————————————————————
// ✅ حماية كل المسارات
router.use(protect);
router.use(restrictTo('department-head'));

// —————————————————————————
// ✅ مسارات رئيس القسم
//الحصول على كل الشركات 
router.get('/companies', getCompanies);
// ➡️ الحصول على طلاب القسم
router.get('/students', getDepartmentStudents);

// ➡️ الحصول على طلبات تحتاج وثيقة رسمية
router.get('/applications/pending', getPendingApplications);

// ➡️ رفع وثيقة رسمية لطالب
router.post(
  '/applications/:id/document',
  uploadDepartmentOfficialDocument.single('officialDocument'),submitOfficialDocument );// ✅ رفع الوثيقة


module.exports = router;



