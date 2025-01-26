const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateObjectId = require('../utils/validateObjectId');
const router = express.Router();
//Private routes for admin only and logged in only
router.post(
  '/signup',
  protect,
  restrictTo('Admin'),
  userController.SignupEmployee
);
router.get('/', protect, restrictTo('Admin'), userController.getAllUsers);
//Public routes
router.get('/logout', protect, userController.logout);
router.get('/me', protect, userController.me);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/:id', validateObjectId, userController.getUser);
router.delete(
  '/:id',
  protect,
  restrictTo('Admin'),
  validateObjectId,
  userController.DeleteUser
);
module.exports = router;
