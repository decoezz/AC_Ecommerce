const express = require('express');
const OrderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();
//Public routes for user
router.post('/', protect, OrderController.createOrder);
//Private routes for Admin and employee
router.use(protect, restrictTo('Admin', 'employee'));
router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrder);
router.get('/:id/user', OrderController.getUsersOrders);
router.get('/last-month', OrderController.getOrderLastMonth);
router.get('/last-week', OrderController.getOrderLastWeek);
router.get('/today', OrderController.getOrderToday);
module.exports = router;
