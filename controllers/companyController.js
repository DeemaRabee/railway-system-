
const Company = require("../models/Company");
const User = require("../models/User");
const TrainingPost = require("../models/TrainingPost");
const Application = require("../models/Application");
const Student = require("../models/Student");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

// ———————————————————————————————————

// @desc    الحصول على جميع الشركات
// @route   GET /api/companies
// @access  Private/Admin
/*exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate('user', 'email');
    ApiResponse.success(res, 'Companies retrieved successfully', { count: companies.length, companies });
  } catch (error) {
    next(error);
  }
};*/

// @desc    الحصول على شركة واحدة
// @route   GET /api/companies/:id
// @access  Private/Admin
/*exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('user', 'email');
    if (!company) return next(new ApiError(404, 'Company not found'));
    ApiResponse.success(res, 'Company retrieved successfully', { company });
  } catch (error) {
    next(error);
  }
};*/

exports.getCompanyProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Authorization token missing"));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user and company
    const user = await User.findById(decoded.id).select("email role");
    if (!user || user.role !== "company") {
      return next(new ApiError(403, "Access denied. Not a company account."));
    }

    const company = await Company.findOne({ user: user._id });
    if (!company) {
      return next(new ApiError(404, "Company profile not found"));
    }

    ApiResponse.success(res, "Company profile retrieved successfully", {
      company,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تعديل ملف الشركة
// @route   PUT /api/companies/profile
// @access  Private/Company
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, fieldOfWork } = req.body;
    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new ApiError(404, "Company profile not found"));

  

    if (req.file) {
      company.profilePicture = req.file.path;
    }

    if (name) company.name = name;
    if (phone) company.phone = phone;
    if (location) company.location = location;
    if (fieldOfWork) company.fieldOfWork = fieldOfWork;

    await company.save();

    logger.info(
      `Company profile updated: ${company.name} (${company.nationalId})`
    );
    ApiResponse.success(res, "Company profile updated successfully", {
      company,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyPosts = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return next(new ApiError(404, "Company not found for this user"));
    }

    const posts = await TrainingPost.find({ company: company._id }).sort({
      createdAt: -1,
    });

    ApiResponse.success(res, "Training posts retrieved successfully", {
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جميع الطلبات لإعلانات الشركة
// @route   GET /api/companies/applications
// @access  Private/Company
exports.getCompanyApplications = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new ApiError(404, "Company not found"));

    const posts = await TrainingPost.find({ company: company._id });
    const postIds = posts.map((post) => post._id);

    const applications = await Application.find({
      trainingPost: { $in: postIds },
    })
      .populate("student", "name department studentId")
      .populate("trainingPost", "title duration")
      .sort({ createdAt: -1 });

    ApiResponse.success(res, "Applications retrieved successfully", {
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث حالة طلب (موافقة/رفض)
// @route   PUT /api/companies/applications/:id
// @access  Private/Company
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return next(new ApiError(400, "Invalid status"));
    }

    const application = await Application.findById(req.params.id).populate(
      "trainingPost"
    );
    if (!application) return next(new ApiError(404, "Application not found"));

    const post = application.trainingPost;
    const company = await Company.findOne({ user: req.user.id });
    if (!company || post.company.toString() !== company._id.toString()) {
      return next(
        new ApiError(403, "Not authorized to update this application")
      );
    }

    application.status = status;
    await application.save();

    ApiResponse.success(res, "Application status updated successfully", {
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تقديم تقرير أداء الطالب (ملف PDF)
// @route   POST /api/companies/applications/:id/activity
// @access  Private/Company
exports.submitActivityReport = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, "No file uploaded"));

    const application = await Application.findById(req.params.id);
    if (!application) return next(new ApiError(404, "Application not found"));
    // تحقق من أن الحالة APPROVED وهناك وثيقة رسمية
    if (application.status !== 'APPROVED' || !application.officialDocument) {
      return next(new ApiError(400, 'Cannot submit report unless student is approved and has an official document'));
    }

    application.activityReports.push(req.file.path);
    await application.save();

    ApiResponse.success(res, "Activity report submitted successfully", {
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تقديم تقرير نهائي للطالب (ملف PDF)
// @route   POST /api/companies/applications/:id/final
// @access  Private/Company
exports.submitFinalReport = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, "No file uploaded"));

    const application = await Application.findById(req.params.id)
      .populate("student")
      .populate("trainingPost");
    if (!application) return next(new ApiError(404, "Application not found"));

    const student = application.student;
    const trainingPost = application.trainingPost;

    // تحقق من حالة التدريب
    if (student.trainingStatus !== "IN_TRAINING") {
      return next(
        new ApiError(
          400,
          "Student must be in training to submit a final report"
        )
      );
    }

    // تحقق من مدة التدريب
    const durationWeeks = trainingPost.duration; 
    const startDate = application.createdAt; // تاريخ بداية التدريب
  
    const currentDate = new Date();

    const weeksElapsed = Math.floor(
      (currentDate - startDate) / (1000 * 60 * 60 * 24 * 7)
    ); // حساب الأسابيع المنقضية

    if (weeksElapsed < durationWeeks) {
      return next(
        new ApiError(
          400,
          `You cannot submit the final report until ${durationWeeks} weeks of training have passed`
        )
      );
    }
     //شرط وجود تقرير نشاط واحد على الأقل
    if (!application.activityReports || application.activityReports.length === 0) {
      return next(new ApiError(400, "At least one activity report must be submitted before uploading the final report."));
    }

    application.finalReportByCompany = req.file.path;
    await application.save();
    if (
       application.activityReports?.length > 0  &&
      application.finalReportByStudent &&
      application.finalReportByCompany
    ) {
      student.trainingStatus = 'COMPLETED';
      await student.save();
    }

    ApiResponse.success(res, "Final report submitted successfully", {
      application,
    });
  } catch (error) {
    next(error);
  }
};
