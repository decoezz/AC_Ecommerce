const express = require('express');
const OrderController = require('../controllers/orderController');
const validateObjectId = require('../utils/Data Validation utils/validateObjectId');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(protect);
//Public routes for user
router.get('/my-orders', OrderController.GetMyOrders);
router.post('/', OrderController.createOrder);
router.patch('/:id', validateObjectId, OrderController.updateOrder);
router.delete('/:id', validateObjectId, OrderController.DeleteOrder);
//Private routes for Admin and employee
router.use(restrictTo('Admin', 'employee'));
router.get('/GetOrders', OrderController.getOrders);
router.get('/last-month', OrderController.getOrderLastMonth);
router.get('/last-week', OrderController.getOrderLastWeek);
router.get('/today', OrderController.getOrderToday);
router.get('/GetOrders/:id', validateObjectId, OrderController.getOrder);
router.get('/:id/user', validateObjectId, OrderController.getUsersOrders);
router.get('/user/:mobileNumber', OrderController.getOrderByMobileNumber);
router.patch('/:id/admin', validateObjectId, OrderController.updateOrder);
router.delete('/:id/admin', validateObjectId, OrderController.DeleteOrder);
module.exports = router;
