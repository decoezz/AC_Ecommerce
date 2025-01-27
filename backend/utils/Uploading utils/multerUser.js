const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'users', // Store images in 'users' folder on Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }], // Optimize image size
  },
});

const uploadUserImage = multer({ storage }).single('profilePicture'); // Accepts only 'profilePicture'

module.exports = uploadUserImage;
