// 📂 controllers/studentController.js  (نسخة نهائية منظمة)
//console.log("st cont");
const Student = require('../models/Student');
const TrainingPost = require('../models/TrainingPost');
const Application = require('../models/Application');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ———————————————————————————————————

// @desc    الحصول على إعلانات التدريب المتاحة
// @route   GET /api/students/posts
// @access  Private/Student
exports.getAvailablePosts = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    const currentDate = new Date();
    const posts = await TrainingPost.find({
      status: 'APPROVED',
      availableUntil: { $gt: currentDate }
    }).populate('company', 'name location fieldOfWork').sort({ createdAt: -1 });

    ApiResponse.success(res, 'Available training posts retrieved successfully', { count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    التقديم على إعلان تدريب
// @route   POST /api/students/posts/:id/apply
// @access  Private/Student




exports.applyForTraining = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, 'Please upload your CV'));

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    if (student.completedHours < 80) {
      return next(new ApiError(400, 'You must complete at least 80 credit hours to apply for training'));
    }

    const post = await TrainingPost.findById(req.params.id);
    if (!post || post.status !== 'APPROVED' || post.availableUntil < new Date()) {
      return next(new ApiError(400, 'This training post is not available for application'));
    }

    const existingApplication = await Application.findOne({ student: student._id, trainingPost: post._id });
    if (existingApplication) {
      return next(new ApiError(400, 'You have already applied for this training post'));
    }
     
    const application = await Application.create({
      student: student._id,
      trainingPost: post._id,
      cv: req.file.path,
      status: 'UNDER_REVIEW',
    });

    logger.info(`Student ${student.name} (${student.universityId}) applied for training post ${post._id}`);
    ApiResponse.success(res, 'Application submitted successfully', { application });
  } catch (error) {
    deleteFileIfExists(req.file?.path);
    next(error);
  }
};

// @desc    الحصول على طلبات الطالب
// @route   GET /api/students/applications
// @access  Private/Student
exports.getStudentApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'trainingPost',
        select: 'title duration location',
        populate: { path: 'company', select: 'name' }
      })
      .sort({ createdAt: -1 });

    ApiResponse.success(res, 'Applications retrieved successfully', { count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    اختيار طلب معتمد للتدريب
// @route   PUT /api/students/applications/:id/select
// @access  Private/Student
exports.selectApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    const application = await Application.findById(req.params.id);
    if (!application) return next(new ApiError(404, 'Application not found'));

    if (application.student.toString() !== student._id.toString()) {
      return next(new ApiError(403, 'Not authorized to select this application'));
    }

    if (application.status !== 'APPROVED') {
      return next(new ApiError(400, 'You can only select approved applications'));
    }

    const alreadySelected = await Application.findOne({ student: student._id, selectedByStudent: true });
    if (alreadySelected) {
      return next(new ApiError(400, 'You have already selected another application'));
    }

    application.selectedByStudent = true;
    await application.save();

    student.trainingStatus = 'WAITING_FOR_APPROVAL';
    await student.save();

    logger.info(`Student ${student.name} (${student.universityId}) selected application ${application._id}`);
    ApiResponse.success(res, 'Application selected successfully', { application });
  } catch (error) {
    next(error);
  }
};
// @desc    تقديم تقرير تدريب نهائي
// @route   POST /api/students/training/report
// @access  Private/Student
exports.submitFinalReport = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, 'No final report uploaded'));

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    if (student.trainingStatus !== 'IN_TRAINING') {
      return next(new ApiError(400, 'You must be in training to submit a final report'));
    }

    const application = await Application.findOne({ student: student._id, selectedByStudent: true }).populate('trainingPost');;
    if (!application) return next(new ApiError(404, 'No selected application found'));
    // تحقُق من مدة التدريب
  
    const trainingPost = application.trainingPost;
    const durationWeeks = trainingPost.duration ||6 ; // افتراضيًا 6 أسابيع إذا لم تكن موجودة
    const startDate = application.createdAt; // تاريخ بداية التدريب
    const currentDate = new Date();
   
    const weeksElapsed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7)); // حساب الأسابيع المنقضية
    
    if (weeksElapsed < durationWeeks) {
      return next(new ApiError(400, `You cannot submit the final report until ${durationWeeks} weeks of training have passed`));
    }

    application.finalReportByStudent = req.file.path;
    await application.save();

    if (application.activityReports.length  && application.finalReportByStudent && application.finalReportByCompany) {
      student.trainingStatus = 'COMPLETED';
      await student.save();
    }

    logger.info(`Student ${student.name} (${student.universityId}) submitted final report`);
    ApiResponse.success(res, 'Final report submitted successfully', { application });
  } catch (error) {
    next(error);
  }
};









//اخر نسخه معدله 
// 📂 controllers/studentController.js (نسخة محدثة وكاملة)
/*
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const TrainingPost = require('../models/TrainingPost');
const Application = require('../models/Application');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ———————————————————————————————————

// Helper: لحفظ ملفات PDF للطالب
const savePDFFile = (folder, file) => {
  const dir = path.join(__dirname, `../uploads/${folder}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, file.buffer);
  return `uploads/${folder}/${fileName}`;
};

// ———————————————————————————————————

// @desc    الحصول على إعلانات التدريب المتاحة
// @route   GET /api/students/posts
// @access  Private/Student
exports.getAvailablePosts = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    const currentDate = new Date();
    const posts = await TrainingPost.find({
      status: 'APPROVED',
      availableUntil: { $gt: currentDate }
    }).populate('company', 'name location fieldOfWork').sort({ createdAt: -1 });

    ApiResponse.success(res, 'Available training posts retrieved successfully', { count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    التقديم على إعلان تدريب
// @route   POST /api/students/posts/:id/apply
// @access  Private/Student
exports.applyForTraining = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, 'Please upload your CV'));

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    if (student.completedHours < 80) {
      return next(new ApiError(400, 'You must complete at least 80 credit hours to apply for training'));
    }

    const post = await TrainingPost.findById(req.params.id);
    if (!post || post.status !== 'APPROVED' || post.availableUntil < new Date()) {
      return next(new ApiError(400, 'This training post is not available for application'));
    }

    const existingApplication = await Application.findOne({ student: student._id, trainingPost: post._id });
    if (existingApplication) {
      return next(new ApiError(400, 'You have already applied for this training post'));
    }

    const cvPath = savePDFFile('cvs', req.file);

    const application = await Application.create({
      student: student._id,
      trainingPost: post._id,
      cv: cvPath,
      status: 'UNDER_REVIEW'
    });

    logger.info(`Student ${student.name} (${student.universityId}) applied for training post ${post._id}`);
    ApiResponse.success(res, 'Application submitted successfully', { application });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على طلبات الطالب
// @route   GET /api/students/applications
// @access  Private/Student
exports.getStudentApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'trainingPost',
        select: 'title duration location',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    ApiResponse.success(res, 'Applications retrieved successfully', { count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    اختيار طلب معتمد للتدريب
// @route   PUT /api/students/applications/:id/select
// @access  Private/Student
exports.selectApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    const application = await Application.findById(req.params.id);
    if (!application) return next(new ApiError(404, 'Application not found'));

    if (application.student.toString() !== student._id.toString()) {
      return next(new ApiError(403, 'Not authorized to select this application'));
    }

    if (application.status !== 'APPROVED') {
      return next(new ApiError(400, 'You can only select approved applications'));
    }

    const alreadySelected = await Application.findOne({ student: student._id, selectedByStudent: true });
    if (alreadySelected) {
      return next(new ApiError(400, 'You have already selected another application'));
    }

    application.selectedByStudent = true;
    await application.save();

    student.trainingStatus = 'WAITING_FOR_APPROVAL';
    await student.save();

    logger.info(`Student ${student.name} (${student.universityId}) selected application ${application._id}`);
    ApiResponse.success(res, 'Application selected successfully', { application });
  } catch (error) {
    next(error);
  }
};

// @desc    تقديم تقرير تدريب نهائي
// @route   POST /api/students/training/report
// @access  Private/Student
exports.submitFinalReport = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, 'No final report uploaded'));

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new ApiError(404, 'Student profile not found'));

    if (student.trainingStatus !== 'IN_TRAINING') {
      return next(new ApiError(400, 'You must be in training to submit a final report'));
    }

    const application = await Application.findOne({ student: student._id, selectedByStudent: true });
    if (!application) return next(new ApiError(404, 'No selected application found'));

    const finalReportPath = savePDFFile('finalReports', req.file);

    application.finalReport = finalReportPath;
    await application.save();

    if (application.activityReports.length >= 2 && application.finalReport) {
      student.trainingStatus = 'COMPLETED';
      await student.save();
    }

    logger.info(`Student ${student.name} (${student.universityId}) submitted final report`);
    ApiResponse.success(res, 'Final report submitted successfully', { application });
  } catch (error) {
    next(error);
  }
};
*/




/*const Student = require('../models/Student');
const User = require('../models/User');
const TrainingPost = require('../models/TrainingPost');
const Application = require('../models/Application');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');

// إعداد التخزين لرفع ملفات السيرة الذاتية
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cvs');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// فلتر الملفات لرفع ملفات السيرة الذاتية
const fileFilter = (req, file, cb) => {
  // قبول ملفات pdf و doc/docx فقط
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF, DOC, or DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    الحصول على جميع إعلانات التدريب المتاحة
// @route   GET /api/students/posts
// @access  Private/Student
exports.getAvailablePosts = async (req, res, next) => {
  try {
    // التأكد من أن المستخدم المسجل الدخول هو طالب
    if (req.user.role !== 'student') {
      return next(new ApiError(403, 'Not authorized to access student resources'));
    }
    
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return next(new ApiError(404, 'Student profile not found'));
    }
    
    // الحصول على جميع الإعلانات المعتمدة والمتاحة
    const currentDate = new Date();
    const posts = await TrainingPost.find({
      status: 'APPROVED',
      availableUntil: { $gt: currentDate }
    }).populate({
      path: 'company',
      select: 'name location fieldOfWork'
    }).sort({ createdAt: -1 });
    
    ApiResponse.success(res, 'Available training posts retrieved successfully', { count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    التقديم على إعلان تدريب
// @route   POST /api/students/posts/:id/apply
// @access  Private/Student
exports.applyForTraining = async (req, res, next) => {
  try {
    // يتم معالجة رفع الملف بواسطة وسيط multer
    if (!req.file) {
      return next(new ApiError(400, 'Please upload your CV'));
    }
    
    // التأكد من أن المستخدم المسجل الدخول هو طالب
    if (req.user.role !== 'student') {
      return next(new ApiError(403, 'Not authorized to access student resources'));
    }
    
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return next(new ApiError(404, 'Student profile not found'));
    }
    
    // التحقق من أن الطالب قد أكمل 80 ساعة معتمدة على الأقل
    if (student.completedHours < 80) {
      return next(new ApiError(400, 'You must complete at least 80 credit hours to apply for training'));
    }
    
    // الحصول على إعلان التدريب
    const post = await TrainingPost.findById(req.params.id);
    
    if (!post) {
      return next(new ApiError(404, 'Training post not found'));
    }
    
    // التأكد من أن الإعلان معتمد ولا يزال متاحًا
    const currentDate = new Date();
    if (post.status !== 'APPROVED' || post.availableUntil < currentDate) {
      return next(new ApiError(400, 'This training post is not available for applications'));
    }
    
    // التحقق مما إذا كان الطالب قد تقدم بالفعل لهذا الإعلان
    const existingApplication = await Application.findOne({
      student: student._id,
      trainingPost: post._id
    });
    
    if (existingApplication) {
      return next(new ApiError(400, 'You have already applied for this training post'));
    }
    
    // إنشاء طلب جديد
    const application = await Application.create({
      student: student._id,
      trainingPost: post._id,
      cv: req.file.path,
      status: 'UNDER_REVIEW'
    });
    
    logger.info(`Student ${student.name} (${student.universityId}) applied for training post ${post._id}`);
    
    ApiResponse.success(res, 'Application submitted successfully', { application }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على طلبات الطالب
// @route   GET /api/students/applications
// @access  Private/Student
exports.getStudentApplications = async (req, res, next) => {
  try {
    // التأكد من أن المستخدم المسجل الدخول هو طالب
    if (req.user.role !== 'student') {
      return next(new ApiError(403, 'Not authorized to access student resources'));
    }
    
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return next(new ApiError(404, 'Student profile not found'));
    }
    
    // الحصول على جميع الطلبات من هذا الطالب
    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'trainingPost',
        select: 'title duration location',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    ApiResponse.success(res, 'Applications retrieved successfully', { count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    اختيار طلب معتمد للتدريب
// @route   PUT /api/students/applications/:id/select
// @access  Private/Student
exports.selectApplication = async (req, res, next) => {
  try {
    // التأكد من أن المستخدم المسجل الدخول هو طالب
    if (req.user.role !== 'student') {
      return next(new ApiError(403, 'Not authorized to access student resources'));
    }
    
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return next(new ApiError(404, 'Student profile not found'));
    }
    
    // البحث عن الطلب
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }
    
    // التأكد من أن الطلب ينتمي لهذا الطالب
    if (application.student.toString() !== student._id.toString()) {
      return next(new ApiError(403, 'Not authorized to select this application'));
    }
    
    // التأكد من أن الطلب معتمد
    if (application.status !== 'APPROVED') {
      return next(new ApiError(400, 'You can only select approved applications'));
    }
    
    // التحقق مما إذا كان الطالب قد اختار بالفعل طلبًا آخر
    const existingSelected = await Application.findOne({
      student: student._id,
      selectedByStudent: true
    });
    
    if (existingSelected) {
      return next(new ApiError(400, 'You have already selected another application for training'));
    }
    
    // تحديد هذا الطلب كمختار
    application.selectedByStudent = true;
    application.updatedAt = Date.now();
    await application.save();
    
    // تحديث حالة الطالب
    student.trainingStatus = 'WAITING_FOR_APPROVAL';
    await student.save();
    
    logger.info(`Student ${student.name} (${student.universityId}) selected application ${application._id} for training`);
    
    ApiResponse.success(res, 'Application selected successfully for training', { application });
  } catch (error) {
    next(error);
  }
};

// @desc    تقديم تقرير تدريب نهائي
// @route   POST /api/students/training/report
// @access  Private/Student
exports.submitFinalReport = async (req, res, next) => {
  try {
    const { reportContent } = req.body;
    
    if (!reportContent) {
      return next(new ApiError(400, 'Final report content is required'));
    }
    
    // التأكد من أن المستخدم المسجل الدخول هو طالب
    if (req.user.role !== 'student') {
      return next(new ApiError(403, 'Not authorized to access student resources'));
    }
    
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return next(new ApiError(404, 'Student profile not found'));
    }
    
    // التأكد من أن الطالب في التدريب
    if (student.trainingStatus !== 'IN_TRAINING') {
      return next(new ApiError(400, 'You must be in training to submit a final report'));
    }
    
    // البحث عن الطلب المختار
    const application = await Application.findOne({
      student: student._id,
      selectedByStudent: true
    });
    
    if (!application) {
      return next(new ApiError(404, 'No selected application found'));
    }
    
    // حفظ التقرير النهائي (في نظام حقيقي، سيتم تخزين مسار الملف)
    const reportFilePath = `uploads/finals/student_${application._id}_${Date.now()}.txt`;
    
    application.finalReport = reportFilePath;
    application.updatedAt = Date.now();
    await application.save();
    
    // التحقق مما إذا كان التدريب مكتملاً (تم تقديم تقرير الطالب وأرسلت الشركة تقريرين على الأقل للنشاط)
    if (application.activityReports.length >= 2) {
      student.trainingStatus = 'COMPLETED';
      await student.save();
    }
    
    logger.info(`Student ${student.name} (${student.universityId}) submitted final training report`);
    
    ApiResponse.success(res, 'Final report submitted successfully', { application });
  } catch (error) {
    next(error);
  }
};*/
