const express = require('express');
const ProductController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateObjectId = require('../utils/validateObjectId');
const router = express.Router();

//public routes for users
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);
//Private route for admin/employees only
router.post(
  '/',
  protect,
  restrictTo('Admin', 'employee'),
  ProductController.createProduct
);
router.patch(
  '/:id',
  protect,
  restrictTo('Admin', 'employee'),
  validateObjectId,
  ProductController.UpdateProduct
);
router.delete(
  '/:id',
  protect,
  restrictTo('Admin', 'employee'),
  validateObjectId,
  ProductController.deleteProduct
);

module.exports = router;
