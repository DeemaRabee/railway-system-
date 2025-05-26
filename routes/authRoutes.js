
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
  updatePassword,
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

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

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
router.put('/updatepassword', protect, restrictTo('company'), validate(updatePasswordSchema), updatePassword);

// —————————————————————————

module.exports = router;

