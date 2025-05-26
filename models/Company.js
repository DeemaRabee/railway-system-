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
  profilePicture: { 
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
