
const express = require("express");
const { validate } = require("../middleware/validateRequest");
const { protect, restrictTo } = require("../middleware/auth");
const Joi = require("joi");

const uploadImage = require("../middleware/uploadCompanyProfilePicture"); // لرفع صورة الشركة
const uploadCompanyActivityReport = require("../middleware/uploadCompanyActivityReport"); // لرفع تقارير النشاط
const uploadCompanyFinalReport = require("../middleware/uploadCompanyFinalReport"); // لرفع التقرير النهائي

const {
  //getCompanies,
  //getCompany,
  updateProfile,
  getCompanyPosts,
  getCompanyApplications,
  //getSingleApplication,
  updateApplicationStatus,
  submitActivityReport,
  submitFinalReport,
  getCompanyProfile,
} = require("../controllers/companyController");

const router = express.Router();

// —————————————————————————
// ✅ Schemas
const updateProfileSchema = Joi.object({
  name: Joi.string(),
  phone: Joi.string(),
  location: Joi.string(),
  fieldOfWork: Joi.string(),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
});

// —————————————————————————
// ✅ حماية كل المسارات
router.use(protect);

// —————————————————————————
// ✅ مسارات الأدمن
//router.get('/', restrictTo('admin'), getCompanies);
//router.get('/:id', restrictTo('admin'), getCompany);

// —————————————————————————
// ✅ مسارات الشركة
router.put(
  "/profile",
  restrictTo("company"),
  uploadImage.single("profilePicture"), // صورة البروفايل
  validate(updateProfileSchema),
  updateProfile
);

router.get("/posts", restrictTo("company"), getCompanyPosts);
router.get("/applications", restrictTo("company"), getCompanyApplications);
//router.get('/applications/:id', restrictTo('company'), getSingleApplication);

router.put(
  "/applications/:id",
  restrictTo("company"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

// ➡️ رفع تقرير نشاط
router.post(
  "/applications/:id/activity",
  restrictTo("company"),
  uploadCompanyActivityReport.single("activityReport"),
  submitActivityReport
);

// ➡️ رفع تقرير نهائي
router.post(
  "/applications/:id/final",
  restrictTo("company"),
  uploadCompanyFinalReport.single("finalReport"),
  submitFinalReport
);

router.get("/profile", getCompanyProfile);

module.exports = router;
