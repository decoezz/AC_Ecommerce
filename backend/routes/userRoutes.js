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
router.get('/logout', protect, userController.logout);
//Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router;
