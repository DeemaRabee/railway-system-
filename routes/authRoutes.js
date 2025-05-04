
// 📂 routes/authRoutes.js
//console.log("auth rout");
const express = require('express');
const { validate } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const Joi = require('joi');
const multer = require('multer');
const uploadCompanyImage = require('../middleware/uploadCompanyProfilePicture');
const {
  registerCompany,
  loginCompany,
  loginStudent,
  loginDepartmentHead,
  getMe,
  //updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const MinistryService = require('../external/ministryService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const router = express.Router();

// —————————————————————————
// ✅ Schemas للتأكيد على البيانات

const companyRegisterSchema = Joi.object({
  nationalId: Joi.string().pattern(/^\d{9}$/).required().messages({
    'string.pattern.base': 'National ID must be 9 digits'
  }),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  location: Joi.string().required(),
  fieldOfWork: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const companyLoginSchema = Joi.object({
  nationalId: Joi.string().pattern(/^\d{9}$/).required(),
  password: Joi.string().required()
});

const studentLoginSchema = Joi.object({
  universityId: Joi.string().pattern(/^\d{7}$/).required(),
  password: Joi.string().required()
});

const departmentHeadLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
/*
const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});
*/
// —————————————————————————
// ✅ Routes

// ✅ التحقق من الرقم الوطني مع الوزارة
router.get('/verify-company/:nationalId', async (req, res, next) => {
  try {
    const { nationalId } = req.params;

    if (!nationalId.match(/^\d{9}$/)) {
      return next(new ApiError(400, 'National ID must be 9 digits'));
    }

    const verificationResult = await MinistryService.verifyCompany(nationalId);

    if (!verificationResult.verified) {
      return next(new ApiError(400, 'Company is not verified with the Ministry'));
    }

    return ApiResponse.success(res, 'Company is verified. You can continue registration.', { nationalId }, 200);

  } catch (error) {
    next(error);
  }
});

//تحميل صورة 
/*router.post(
  '/register/company',
  uploadCompanyImage.single('profilePicture'),  // 👈 هذا المطلوب
  validate(companyRegisterSchema),
  registerCompany
);*/
//router.post('/register/company', upload.single('profilePicture'), validate(companyRegisterSchema), registerCompany);
// ✅ تسجيل شركة جديدة




//انشاء حساب شركه بعد التحقق منها 
router.post('/register/company', validate(companyRegisterSchema), registerCompany);

// ✅ تسجيل دخول الشركة
router.post('/login/company', validate(companyLoginSchema), loginCompany);

// ✅ تسجيل دخول الطالب
router.post('/login/student', validate(studentLoginSchema), loginStudent);

// ✅ تسجيل دخول رئيس القسم
router.post('/login/department-head', validate(departmentHeadLoginSchema), loginDepartmentHead);

// ✅ نسيت كلمة المرور (فقط للشركات)
router.post('/forgotpassword', forgotPassword);

// ✅ إعادة تعيين كلمة المرور (فقط للشركات)
router.put('/resetpassword/:resettoken', resetPassword);

// ✅ الحصول على معلوماتي
router.get('/me', protect, getMe);

// ✅ تحديث كلمة المرور (فقط الشركات)
//router.put('/updatepassword', protect, restrictTo('company'), validate(updatePasswordSchema), updatePassword);

// —————————————————————————

module.exports = router;



//كود اخر تعديل 
/*const express = require('express');
const { validate } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const Joi = require('joi');
const {
  registerCompany,
  loginCompany,
  loginStudent,
  loginDepartmentHead,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const MinistryService = require('../external/ministryService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const router = express.Router();

// —————————————————————————
// Schemas للتأكيد على البيانات

const companyRegisterSchema = Joi.object({
  nationalId: Joi.string().pattern(/^\d{9}$/).required().messages({
    'string.pattern.base': 'National ID must be 9 digits'
  }),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  location: Joi.string().required(),
  fieldOfWork: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const companyLoginSchema = Joi.object({
  nationalId: Joi.string().pattern(/^\d{9}$/).required(),
  password: Joi.string().required()
});

const studentLoginSchema = Joi.object({
  universityId: Joi.string().pattern(/^\d{7}$/).required(),
  password: Joi.string().required()
});

const departmentHeadLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// —————————————————————————
// Routes

// ⬅️ التحقق من الرقم الوطني مع الوزارة
router.get('/verify-company/:nationalId', async (req, res, next) => {
  try {
    const { nationalId } = req.params;

    if (!nationalId.match(/^\d{9}$/)) {
      return next(new ApiError(400, 'National ID must be 9 digits'));
    }

    const verificationResult = await MinistryService.verifyCompany(nationalId);

    if (!verificationResult.verified) {
      return next(new ApiError(400, 'Company is not verified with the Ministry'));
    }

    return ApiResponse.success(res, 'Company is verified. You can continue registration.', { nationalId }, 200);

  } catch (error) {
    next(error);
  }
});

// ⬅️ تسجيل شركة
router.post('/register/company', validate(companyRegisterSchema), registerCompany);

// ⬅️ تسجيل دخول شركة
router.post('/login/company', validate(companyLoginSchema), loginCompany);

// ⬅️ تسجيل دخول طالب
router.post('/login/student', validate(studentLoginSchema), loginStudent);

// ⬅️ تسجيل دخول رئيس قسم
router.post('/login/department-head', validate(departmentHeadLoginSchema), loginDepartmentHead);

// ⬅️ نسيت كلمة المرور
router.post('/forgotpassword', forgotPassword);

// ⬅️ إعادة تعيين كلمة المرور
router.post('/resetpassword', resetPassword);

// ⬅️ الحصول على معلوماتي
router.get('/me', protect, getMe);

// ⬅️ تحديث كلمة المرور
router.put('/updatepassword', protect, restrictTo('company'), validate(updatePasswordSchema), updatePassword);

// —————————————————————————

module.exports = router;

*/































/*const express = require('express');
const { validate } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const Joi = require('joi');
const {
  registerCompany,
  login,
  getMe,
  updatePassword
} = require('../controllers/authController');

const router = express.Router();

// مخططات التحقق
const companyRegisterSchema = Joi.object({
  nationalId: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'National ID must be 10 digits'
  }),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  location: Joi.string().required(),
  fieldOfWork: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().required(),
  universityId: Joi.string().pattern(/^\d{7}$/),
  nationalId: Joi.string().pattern(/^\d{10}$/)
}).xor('email', 'universityId', 'nationalId').messages({
  'object.xor': 'Please provide either email, university ID, or national ID'
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// المسارات
router.post('/register/company', validate(companyRegisterSchema), registerCompany);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
//router.put('/updatepassword', protect, validate(updatePasswordSchema), updatePassword);
router.put('/updatepassword', protect, restrictTo('company'), validate(updatePasswordSchema), updatePassword);


module.exports = router;*/























//جديدددددددددددددددددددد
/*
const express = require('express');
const { validate } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const Joi = require('joi');
const {
  registerCompany,
  login,
  getMe,
  updatePassword
} = require('../controllers/authController');

// إضافات جديدة للتحقق من الرقم الوطني
const MinistryService = require('../external/ministryService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const router = express.Router();

// مخططات التحقق باستخدام Joi

const companyRegisterSchema = Joi.object({
  nationalId: Joi.string().pattern(/^\d{9}$/).required().messages({
    'string.pattern.base': 'National ID must be 9 digits'
  }),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  location: Joi.string().required(),
  fieldOfWork: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().required(),
  universityId: Joi.string().pattern(/^\d{7}$/),
  nationalId: Joi.string().pattern(/^\d{9}$/)
}).xor('email', 'universityId', 'nationalId').messages({
  'object.xor': 'Please provide either email, university ID, or national ID'
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// —————————————————————————
// المسارات (Routes)

// ⬅️ مسار تحقق الرقم الوطني قبل فتح التسجيل الكامل
router.get('/verify-company/:nationalId', async (req, res, next) => {
  try {
    const { nationalId } = req.params;

    // التحقق من تنسيق الرقم الوطني
    if (!nationalId.match(/^\d{9}$/)) {
      return next(new ApiError(400, 'National ID must be 9 digits'));
    }

    // تحقق من الوزارة
    const verificationResult = await MinistryService.verifyCompany(nationalId);

    if (!verificationResult.verified) {
      return next(new ApiError(400, 'Company is not verified with the Ministry'));
    }

    // رجع نجاح
    return ApiResponse.success(res, 'Company is verified. You can continue registration.', { nationalId }, 200);

  } catch (error) {
    next(error);
  }
});

// ⬅️ تسجيل شركة
router.post('/register/company', validate(companyRegisterSchema), registerCompany);

// ⬅️ تسجيل دخول (طلاب، شركات)
router.post('/login', validate(loginSchema), login);

// ⬅️ الحصول على بيانات الحساب الخاص بي
router.get('/me', protect, getMe);

// ⬅️ تحديث كلمة السر
router.put('/updatepassword', protect, restrictTo('company'), validate(updatePasswordSchema), updatePassword);

// —————————————————————————

module.exports = router;
*/