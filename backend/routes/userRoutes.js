const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateObjectId = require('../utils/Data Validation utils/validateObjectId');
const uploadUserImage = require('../utils/Uploading utils/multerUser');
const router = express.Router();
//Private routes for admin only and logged in only
router.post(
  '/admin/signup',
  protect,
  restrictTo('Admin'),
  userController.SignupEmployee
);
router.get('/', protect, restrictTo('Admin'), userController.getAllUsers);
//Public routes
router.get('/user/likedProducts', protect, userController.likedProduct);
router.get('/logout', protect, userController.logout);
router.get('/me', protect, userController.me);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/:id', validateObjectId, userController.getUser);
router.get('/user/:mobileNumber', userController.getUserByNumber);
router.patch('/', protect,userController.updateUser);
router.put(
  '/upload-photo',
  protect,
  uploadUserImage,
  userController.uploadUserPhoto
);
router.delete(
  '/:id',
  protect,
  restrictTo('Admin'),
  validateObjectId,
  userController.DeleteUser
);
module.exports = router;
