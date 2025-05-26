
const multer = require('multer');
const path = require('path');
const companyProfileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profilePictures/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-profile-${Date.now()}${path.extname(file.originalname)}`)
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const uploadCompanyProfilePicture = multer({ storage: companyProfileStorage, fileFilter: imageFilter });
module.exports = uploadCompanyProfilePicture;





