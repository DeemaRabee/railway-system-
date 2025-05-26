
const DepartmentHead = require('../models/DepartmentHead');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Company = require('../models/Company');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');


// ———————————————————————————————————


// @desc    الحصول على جميع الشركات
// @route   GET /api/department-heads/companies
// @access  Private/DepartmentHead
/*exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate('user', 'email');
    ApiResponse.success(res, 'Companies retrieved successfully', { count: companies.length, companies });
  } catch (error) {
    next(error);
  }
};*/
// @desc    الحصول على جميع الشركات
// @route   GET /api/department-heads/companies
// @access  Private/DepartmentHead
/*exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate('user', 'email');

    const companyData = await Promise.all(companies.map(async (company) => {
      // عدد البوستات التدريبية الخاصة بالشركة
      const postCount = await TrainingPost.countDocuments({ company: company._id });

      // نجيب كل بوستات الشركة (حقل _id فقط)
      const posts = await TrainingPost.find({ company: company._id }, '_id');
      const postIds = posts.map(post => post._id);

      // نجيب الطلاب الذين لديهم officialDocument في التطبيقات المرتبطة بهذه البوستات
      const studentIds = await Application.distinct('student', {
        trainingPost: { $in: postIds },
        officialDocument: { $exists: true, $ne: null }  // شرط وجود الوثيقة
      });

      const studentCount = studentIds.length;

      return {
        _id: company._id,
        name: company.name,
        joinedAt: company.createdAt,
        postCount,
        studentCount,
        user: company.user,
      };
    }));

    ApiResponse.success(res, 'Companies retrieved successfully', {
      count: companyData.length,
      companies: companyData,
    });
  } catch (error) {
    next(error);
  }
};
*/
// @desc    الحصول على جميع الشركات (اسم + إيميل فقط)
// @route   GET /api/department-heads/companies
// @access  Private/DepartmentHead
exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find()
      .select('name user phone') // نجيب فقط الحقول المطلوبة
      .populate('user', 'email'); // نجيب الإيميل فقط من جدول المستخدمين

    const companyData = companies.map(company => ({
      _id: company._id,
      name: company.name,
      email: company.user?.email || null,
      phone: company.phone || null,
    }));

    ApiResponse.success(res, 'Companies retrieved successfully', {
      count: companyData.length,
      companies: companyData,
    });
  } catch (error) {
    next(error);
  }
};



// @desc    الحصول على جميع الطلاب داخل قسم رئيس القسم مع الطلبات والتقارير
// @route   GET /api/department-heads/students
// @access  Private/DepartmentHead
exports.getDepartmentStudents = async (req, res, next) => {
  try {
    const departmentHead = await DepartmentHead.findOne({ user: req.user.id });
    if (!departmentHead)
      return next(new ApiError(404, 'Department head profile not found'));

    const students = await Student.find({ department: departmentHead.department }).sort({ name: 1 });

    const studentsWithApplications = await Promise.all(
      students.map(async (student) => {
        const applications = await Application.find({ student: student._id })
          .populate({
            path: 'trainingPost',
            select: 'title duration location',
            populate: {
              path: 'company',
              select: 'name location'
            }
          })
          .lean();

        // تأكد من التنسيق الآمن عند غياب trainingPost أو الشركة
        const safeApplications = applications.map(app => ({
          id: app._id,
          status: app.status,
          cv: app.cv || null,
          officialDocument: app.officialDocument || null,
          activityReports: app.activityReports || [],
          finalReportByStudent: app.finalReportByStudent || null,
          finalReportByCompany: app.finalReportByCompany || null,
          trainingPost: app.trainingPost ? {
            title: app.trainingPost.title,
            duration: app.trainingPost.duration,
            location: app.trainingPost.location,
            company: app.trainingPost.company ? {
              name: app.trainingPost.company.name,
              location: app.trainingPost.company.location
        
            } : null
          } : null
        }));

        return {
          ...student.toObject(),
          applications: safeApplications.length > 0 ? safeApplications : []
        };
      })
    );

    ApiResponse.success(res, 'Department students retrieved successfully', {
      count: students.length,
      students: studentsWithApplications
    });
  } catch (error) {
    next(error);
  }
};


// @desc    الحصول على طلبات الطلاب الذين يحتاجون وثيقة رسمية
// @route   GET /api/department-heads/applications/pending
// @access  Private/DepartmentHead
exports.getPendingApplications = async (req, res, next) => {
  try {
    const departmentHead = await DepartmentHead.findOne({ user: req.user.id });
    if (!departmentHead) return next(new ApiError(404, 'Department head profile not found'));

    const students = await Student.find({
      department: departmentHead.department,
      trainingStatus: 'WAITING_FOR_APPROVAL'
    });

    const studentIds = students.map(student => student._id);

    const applications = await Application.find({
      student: { $in: studentIds },
      selectedByStudent: true,
      officialDocument: { $exists: false }
    })
      .populate('student', 'name universityId department')
      .populate({
        path: 'trainingPost',
        select: 'title duration',
        populate: { path: 'company', select: 'name location' }
      });

    ApiResponse.success(res, 'Pending applications retrieved successfully', { count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    رفع وثيقة التدريب الرسمية وتحويل حالة الطالب إلى IN_TRAINING
// @route   POST /api/department-heads/applications/:id/document
// @access  Private/DepartmentHead
exports.submitOfficialDocument = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, 'No file uploaded'));

    const departmentHead = await DepartmentHead.findOne({ user: req.user.id });
    if (!departmentHead) return next(new ApiError(404, 'Department head profile not found'));

    const application = await Application.findById(req.params.id).populate('student');
    if (!application) return next(new ApiError(404, 'Application not found'));

    if (application.student.department !== departmentHead.department) {
      return next(new ApiError(403, 'This student does not belong to your department'));
    }

    const student = await Student.findById(application.student._id);
    if (student.trainingStatus !== 'WAITING_FOR_APPROVAL') {
      return next(new ApiError(400, 'Student is not in a waiting for approval state'));
    }

    application.officialDocument = req.file.path;
    application.startDate = new Date();
    await application.save();

    student.trainingStatus = 'IN_TRAINING';
    await student.save();

    logger.info(`Official document submitted for student ${student.name} (${student.universityId})`);
    ApiResponse.success(res, 'Official document submitted and student moved to IN_TRAINING', { application, student });
  } catch (error) {
    next(error);
  }
};

