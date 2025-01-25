const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();
//Private routes for admin only and logged in only
router.post(
  '/signup',
  protect,
  restrictTo('Admin'),
  userController.SignupEmployee
);
router.get('/', protect, restrictTo('Admin'), userController.getAllUsers);
router.delete('/:id', protect, restrictTo('Admin'), userController.DeleteUser);
//Public routes
router.get('/me', protect, userController.me);
router.get('/:id', userController.getUser);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', protect, userController.logout);
module.exports = router;
