//console.log("trai.js/model");
const mongoose = require('mongoose');

const trainingPostSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Training title is required'],
    trim: true
  },
  duration: {
    type: Number,
    enum: [6, 8],
    required: [true, 'Training duration is required']
  },
  location: {
    type: String,
    required: [true, 'Training location is required']
  },
  availableUntil: {
    type: Date,
    required: [true, 'Available until date is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Training start date is required'],
    validate: {
      validator: function(value) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return value > now;
      },
      message: 'Start date must be a future date'
    }
  },
  status: {
    type: String,
    enum: ['APPROVED', 'REJECTED'],
    default: 'APPROVED'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true // يضيف createdAt و updatedAt تلقائيًا
});

// Indexes
trainingPostSchema.index({ company: 1, title: 1 }, { unique: true });
trainingPostSchema.index({ status: 1, availableUntil: 1 });

// Virtual for applications
trainingPostSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'trainingPost',
  justOne: false
});

const TrainingPost = mongoose.model('TrainingPost', trainingPostSchema);

module.exports = TrainingPost;

/*const mongoose = require('mongoose');

const trainingPostSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Training title is required'],
    trim: true
  },
  duration: {
    type: Number,
    enum: [6, 8],
    required: [true, 'Training duration is required']
  },
  location: {
    type: String,
    required: [true, 'Training location is required']
  },
  availableUntil: {
    type: Date,
    required: [true, 'Available until date is required']
  },
  startDate: {
  type: Date,
  required: [true, 'Training start date is required'],
  validate: {
    validator: function(value) {
      // فقط تحقق إذا الـ doc جديد أو تم تعديله
      return value > new Date();
    },
    message: 'Start date must be a future date'
  }
},

  status: {
    type: String,
    enum: ['APPROVED', 'REJECTED'],
    default: 'APPROVED'
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
trainingPostSchema.index({ company: 1, title: 1 }, { unique: true });
trainingPostSchema.index({ status: 1, availableUntil: 1 });

// Virtual for applications
trainingPostSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'trainingPost',
  justOne: false
});

const TrainingPost = mongoose.model('TrainingPost', trainingPostSchema);

module.exports = TrainingPost;*/


/*const mongoose = require('mongoose');

const trainingPostSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Training title is required'],
    trim: true
  },
  duration: {
    type: Number,
    enum: [6, 8],
    required: [true, 'Training duration is required']
  },
  location: {
    type: String,
    required: [true, 'Training location is required']
  },
  availableUntil: {
    type: Date,
    required: [true, 'Available until date is required']
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DepartmentHead'
  },
  approvedAt: Date,
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
trainingPostSchema.index({ company: 1, title: 1 }, { unique: true });
trainingPostSchema.index({ status: 1, availableUntil: 1 });

// Virtual for applications
trainingPostSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'trainingPost',
  justOne: false
});

const TrainingPost = mongoose.model('TrainingPost', trainingPostSchema);

module.exports = TrainingPost;*/
