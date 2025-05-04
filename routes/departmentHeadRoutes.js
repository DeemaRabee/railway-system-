// 📂 routes/departmentHeadRoutes.js
//console.log("depa rout");
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const uploadDepartmentOfficialDocument = require('../middleware/uploadOfficialDocument'); // ✅ ميدل وير رفع وثيقة رسمية
const {
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

// ➡️ الحصول على طلاب القسم
router.get('/students', getDepartmentStudents);

// ➡️ الحصول على طلبات تحتاج وثيقة رسمية
router.get('/applications/pending', getPendingApplications);

// ➡️ رفع وثيقة رسمية لطالب
router.post(
  '/applications/:id/document',
  uploadDepartmentOfficialDocument.single('officialDocument'),submitOfficialDocument );// ✅ رفع الوثيقة



// —————————————————————————

module.exports = router;



//كود اخر تعديل 
/*const express = require('express');
const { validate } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const Joi = require('joi');
const {
  getDepartmentStudents,
  getPendingApplications,
  submitOfficialDocument
} = require('../controllers/departmentHeadController');

const router = express.Router();

// مخطط التحقق للوثائق
const submitDocumentSchema = Joi.object({
  documentContent: Joi.string().required()
});

// حماية جميع المسارات
router.use(protect);
router.use(restrictTo('department-head'));

// مسارات رئيس القسم
router.get('/students', getDepartmentStudents);
router.get('/applications/pending', getPendingApplications);
router.post('/applications/:id/document', validate(submitDocumentSchema), submitOfficialDocument);

module.exports = router;



*/









/*const express = require('express');
const { validate } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const Joi = require('joi');
const {
  getDepartmentStudents,
  getPendingTrainingPosts,
  reviewTrainingPost,
  getPendingApplications,
  submitOfficialDocument
} = require('../controllers/departmentHeadController');

const router = express.Router();

// مخططات التحقق
const reviewPostSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required()
});

const submitDocumentSchema = Joi.object({
  documentContent: Joi.string().required()
});

// حماية جميع المسارات
router.use(protect);
router.use(restrictTo('department-head'));

// مسارات رئيس القسم
router.get('/students', getDepartmentStudents);
router.get('/posts/pending', getPendingTrainingPosts);
router.put('/posts/:id/review', validate(reviewPostSchema), reviewTrainingPost);
router.get('/applications/pending', getPendingApplications);
router.post('/applications/:id/document', validate(submitDocumentSchema), submitOfficialDocument);

module.exports = router;*/