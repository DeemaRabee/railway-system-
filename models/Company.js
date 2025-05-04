//console.log("compan.js/model");
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid National ID. It must be 9 digits.`
    }
  },
  name: {
    type: String,
    required: [true, 'Company name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  fieldOfWork: {
    type: String,
    required: [true, 'Field of work is required']
  },
  verified: {
    type: Boolean,
    default: false
  },
  profilePicture: { // ✅ توحيد الاسم هنا
    type: String,
    default: 'default-company.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

companySchema.virtual('trainingPosts', {
  ref: 'TrainingPost',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;


/*const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid National ID. It must be 10 digits.`
    }
  },
  name: {
    type: String,
    required: [true, 'Company name is required']
  },
  phone: {
    type: Number,
    required: [true, 'Phone number is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  fieldOfWork: {
    type: String,
    required: [true, 'Field of work is required']
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for training posts
companySchema.virtual('trainingPosts', {
  ref: 'TrainingPost',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;*/



// models/Company.js
/*
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{9}$/.test(v); // 9 أرقام
      },
      message: props => `${props.value} is not a valid National ID. It must be 9 digits.`
    }
  },
  name: {
    type: String,
    required: [true, 'Company name is required']
  },
  phone: {
    type: Number,
    required: [true, 'Phone number is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  fieldOfWork: {
    type: String,
    required: [true, 'Field of work is required']
  },
  verified: {
    type: Boolean,
    default: false
  },
  companyProfilePicture: {
    type: String,
    default: 'default-company.png' // ← صورة افتراضية لو ما أرسلت صورة
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

companySchema.virtual('trainingPosts', {
  ref: 'TrainingPost',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
*/