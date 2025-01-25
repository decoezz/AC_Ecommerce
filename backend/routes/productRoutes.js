const express = require('express');
const ProductController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

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
  ProductController.UpdateProduct
);
router.delete(
  '/:id',
  protect,
  restrictTo('Admin', 'employee'),
  ProductController.deleteProduct
);
//public routes for users
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);
module.exports = router;
