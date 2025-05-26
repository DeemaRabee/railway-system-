
const TrainingPost = require('../models/TrainingPost');
const Company = require('../models/Company');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const Application = require('../models/Application');
// ———————————————————————————————————

// @desc    إنشاء إعلان تدريب جديد
// @route   POST /api/training-posts
// @access  Private/Company
exports.createTrainingPost = async (req, res, next) => {
  try {
    
    const { title, duration, location, availableUntil, description } = req.body;

    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new ApiError(404, 'Company profile not found'));

    if (![6, 8].includes(duration)) {
      return next(new ApiError(400, 'Duration must be either 6 or 8 weeks'));
    }
    const availableUntilDate = new Date(availableUntil);
    if (availableUntilDate <= new Date()) {
      return next(new ApiError(400, 'Available until date must be in the future'));
    }

    const post = await TrainingPost.create({
      company: company._id,
      title,
      duration,
      location,
      availableUntil: availableUntilDate,
      description,
      status: 'APPROVED' // مباشرة معتمد
    });

    logger.info(`Company ${company.name} created training post: ${title}`);
    ApiResponse.success(res, 'Training post created successfully', { post }, 201);
  } catch (error) {
    next(error);
  }
};



// ———————————————————————————————————

// @desc    تحديث إعلان تدريب
// @route   PUT /api/training-posts/:id
// @access  Private/Company
exports.updatePost = async (req, res, next) => {
  try {
    const { title, duration, location, availableUntil, description} = req.body;

    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new ApiError(404, 'Company profile not found'));


    let post = await TrainingPost.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Training post not found'));

    if (post.company.toString() !== company._id.toString()) {
      return next(new ApiError(403, 'Not authorized to update this post'));
    }

    if (duration && ![6, 8].includes(duration)) {
      return next(new ApiError(400, 'Duration must be either 6 or 8 weeks'));
    }

    if (availableUntil) {
      const availableUntilDate = new Date(availableUntil);
      if (availableUntilDate <= new Date()) {
        return next(new ApiError(400, 'Available until date must be in the future'));
      }
      post.availableUntil = availableUntilDate;
    }
   
    post.title = title || post.title;
    post.duration = duration || post.duration;
    post.location = location || post.location;
    post.description = description || post.description;

    await post.save();

    logger.info(`Company ${company.name} updated training post: ${post._id}`);
    ApiResponse.success(res, 'Training post updated successfully', { post });
  } catch (error) {
    next(error);
  }
};

// ———————————————————————————————————

// @desc    حذف إعلان تدريب
// @route   DELETE /api/training-posts/:id
// @access  Private/Company
exports.deletePost = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new ApiError(404, 'Company profile not found'));

    const post = await TrainingPost.findById(req.params.id);
    if (!post) return next(new ApiError(404, 'Training post not found'));

    if (post.company.toString() !== company._id.toString()) {
      return next(new ApiError(403, 'Not authorized to delete this post'));
    }
    // ✅ تحقق إذا في تقديمات لهذا البوست
const applicationsCount = await Application.countDocuments({ trainingPost: post._id });

if (applicationsCount > 0) {
  return next(new ApiError(400, 'Cannot delete post. Students have already applied.'));
}


    await post.deleteOne();
    


    logger.info(`Company ${company.name} deleted training post: ${post._id}`);
    ApiResponse.success(res, 'Training post deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
