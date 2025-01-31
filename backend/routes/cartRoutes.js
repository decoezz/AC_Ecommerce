const express = require('express');
const cartController = require('../controllers/cartController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateObjectId = require('../utils/Data Validation utils/validateObjectId');
const router = express.Router();
router.use(protect);
router.get('/', cartController.getCart);
router.post('/', cartController.addItemToCart);
router.patch('/:productId', validateObjectId, cartController.updateCartItem);
router.delete('/:productId', validateObjectId, cartController.removeCartItem);

router.delete('/', cartController.clearCart);
module.exports = router;
