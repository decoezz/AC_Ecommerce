const express = require('express');
const ProductController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateObjectId = require('../utils/Data Validation utils/validateObjectId');
const uploadProductImages = require('../utils/Uploading utils/multerProduct');
const router = express.Router();

//public routes for users
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);
//Private route for admin/employees only
router.use(protect, restrictTo('Admin', 'employee'));
router.post('/', uploadProductImages, ProductController.createProduct);
router.patch('/:id', validateObjectId, ProductController.UpdateProduct);
router.put(
  '/update-product-images/:id',
  validateObjectId,
  uploadProductImages,
  ProductController.UpdateImages
);
router.delete('/:id', validateObjectId, ProductController.deleteProduct);
router.delete('/delete-product-image', ProductController.deleteProductImage);

module.exports = router;
