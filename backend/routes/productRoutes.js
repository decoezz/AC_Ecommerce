const express = require('express');
const ProductController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateObjectId = require('../utils/Data Validation utils/validateObjectId');
const uploadProductImages = require('../utils/Uploading utils/multerProduct');
const router = express.Router();

//public routes for users
router.get('/', ProductController.getAllProducts);
router.get('/:id', validateObjectId, ProductController.getProduct);
router.get('/ac/:modelNumber', ProductController.getProductByModelNumber);
//Routes for reviews
router.get('/reviews/:productId', ProductController.getProductReviews);
router.post('/reviews/:productId', protect, ProductController.addReview);
router.patch('/reviews/:productId', protect, ProductController.UpdateReview);
router.put('/reviews/:reviewId/like', protect, ProductController.LikeReview);
router.put(
  '/reviews/:reviewId/dislike',
  protect,
  ProductController.DislikeReview
);
router.delete('/reviews/:productId', protect, ProductController.DeleteReview);
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
