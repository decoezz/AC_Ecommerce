const express = require('express');
const OrderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();
//Private routes for Admin and employee
router.get(
  '/:id/user',
  protect,
  restrictTo('Admin', 'employee'),
  OrderController.getUsersOrders
);

module.exports = router;
