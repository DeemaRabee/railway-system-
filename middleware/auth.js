
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const ApiError = require('../utils/apiError');
const config = require('../config/config');
const User = require('../models/User');


const protect = async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
  }

  try {
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // 4) Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, 'User recently changed password! Please log in again.'));
    }

    //  بدل ما نحط الكائن كامل، نأخذ فقط البيانات المطلوبة
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized, token failed'));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = String(req.user.role).toLowerCase(); //  نحولها ل lowercase string


    if (!roles.includes(userRole)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};


module.exports = { protect, restrictTo };
