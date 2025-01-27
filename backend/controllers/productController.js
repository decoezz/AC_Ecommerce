const AppError = require('../utils/Error Handeling utils/appError');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const AC = require('../models/acModel');
const Review = require('../models/reviewModel');
const {
  validateProductData,
} = require('../utils/Data Validation utils/validateProductData');
const checkProductExists = require('../utils/checkProductExists');
const {
  validateUpdateProduct,
} = require('../utils/Data Validation utils/validateUpdateProduct');
//Create Product
exports.createProduct = catchAsync(async (req, res, next) => {
  const newBody = {};
  Object.keys(req.body).forEach((key) => {
    const trimmedKey = key.trim();
    newBody[trimmedKey] = req.body[key];
  });
  req.body = newBody;
  if (req.body.features) {
    try {
      req.body.features = JSON.parse(req.body.features);
    } catch (err) {
      return next(new AppError('Invalid JSON format for features', 400));
    }
  }
  validateProductData(req.body);
  const { modelNumber } = req.body;
  const existingProduct = await AC.findOne({ modelNumber });
  if (existingProduct) {
    return next(new AppError('Model Number must be unique', 400));
  }
  if (!req.files || req.files.length === 0) {
    return next(new AppError('At least one product image is required.', 400));
  }
  const photoUrls = req.files.map((file) => file.path);
  const product = await AC.create({
    ...req.body,
    photos: photoUrls,
  });
  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    product: {
      id: product._id,
      brand: product.brand,
      modelNumber: product.modelNumber,
      powerConsumption: product.powerConsumption,
      price: product.price,
      features: product.features,
      inStock: product.inStock,
      quantityInStock: product.quantityInStock,
      coolingCapacity: product.coolingCapacity,
      photos: product.photos, // Cloudinary image URLs
    },
  });
});
//Get All Products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(AC.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  await features.paginate(); // Execute pagination (this method is async)
  // Execute final query
  const products = await features.query;
  if (!products || products.length === 0) {
    return next(
      new AppError(
        'There is no ACS available right now.Please try again later',
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    totalResults: features.totalCount, // Returns total items available
    results: products.length,
    data: { products },
  });
});
//Get a certain Product
exports.getProduct = catchAsync(async (req, res, next) => {
  const acId = req.params.id;
  const Ac = await AC.findById(acId);
  if (!Ac) {
    return next(
      new AppError(
        `There no AC with this ID : ${acId}.Please try again later`,
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    data: { Ac },
  });
});
//Get Product by modelNumber
exports.getProductByModelNumber = catchAsync(async (req, res, next) => {
  const modelNumber = req.params.modelNumber;
  if (!modelNumber) {
    return next(new AppError('Please enter a valid Model Number', 404));
  }
  const Ac = await AC.findOne({ modelNumber: modelNumber });
  if (!Ac) {
    return next(
      new AppError(
        'There is No AC with this Model Number.Please try again later',
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'AC found successfully',
    data: { Ac },
  });
});
//Update a product
exports.UpdateProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  checkProductExists(productId);
  const validateData = validateUpdateProduct(req.body);
  const newProduct = await AC.findByIdAndUpdate(productId, validateData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully',
    data: {
      newProduct,
    },
  });
});
//Delete a product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  checkProductExists(productId);
  await AC.deleteOne({ _id: productId });
  res.status(204).json({
    status: 'success',
    message: 'Product Deleted successfully',
    data: null,
  });
});
//Delete a product image
exports.deleteProductImage = catchAsync(async (req, res, next) => {
  const { productId, publicId } = req.body; // Cloudinary public ID & Product ID
  if (!productId || !publicId) {
    return next(
      new AppError('Product ID and Image Public ID are required', 400)
    );
  }
  // Remove the image from Cloudinary
  await cloudinary.uploader.destroy(publicId);
  // Update the product in the database
  const updatedProduct = await AC.findByIdAndUpdate(
    productId,
    {
      $pull: {
        photos: `https://res.cloudinary.com/your-cloud-name/image/upload/${publicId}`,
      },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully',
    data: { updatedProduct },
  });
});
//Upload images of a product
exports.UpdateImages = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const product = await AC.findById(productId);
  if (!product) {
    return next(
      new AppError('No product found with this ID. Please try again.', 404)
    );
  }
  if (!req.files || req.files.length === 0) {
    return next(new AppError('No photos uploaded', 400));
  }
  // Delete existing images from Cloudinary
  try {
    for (let oldImage of product.photos) {
      const publicId = oldImage.split('/').pop().split('.')[0]; // Extract Cloudinary Public ID
      await cloudinary.uploader.destroy(publicId); // Delete from Cloudinary
    }
  } catch (err) {
    console.error('Failed to delete old images:', err);
  }
  // Upload new images and store URLs
  const newImageUrls = req.files.map((file) => file.path);
  // Replace images in the database
  product.photos = newImageUrls;
  await product.save();
  res.status(200).json({
    status: 'success',
    message: 'Images updated successfully',
    data: { product },
  });
});
//Create a Review
exports.addReview = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const { rating, comment } = req.body;
  const userId = req.user.id;
  const product = await AC.findById(productId);
  if (!product) {
    return next(new AppError('No Product found with this ID', 400));
  }
  //Check if the user has already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: userId,
  });
  if (existingReview) {
    return next(new AppError('You have already reviewd this product', 400));
  }
  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment,
  });
  // Update product's average rating
  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    product.averageRating = stats[0].avgRating;
    product.reviewCount = stats[0].reviewCount;
  } else {
    product.averageRating = 0;
    product.reviewCount = 0;
  }
  await product.save();
  res.status(201).json({
    status: 'success',
    message: 'Review Added Successfully',
    data: { review },
  });
});
//Get All Reviews For a product
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const reviews = await Review.find({ product: productId })
    .populate('user', 'name email')
    .lean(); // Converts Mongoose docs to plain objects for modification
  if (!reviews || reviews.length === 0) {
    return next(new AppError('There is no reviews for this product yet.', 404));
  }
  // Modify reviews to return counts instead of actual user lists
  const formattedReviews = reviews.map((review) => ({
    _id: review._id,
    user: review.user,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    likesCount: review.likes ? review.likes.length : 0,
    dislikesCount: review.dislike ? review.dislike.length : 0,
  }));
  res.status(200).json({
    status: 'success',
    message: 'Reviews retrived Successfully',
    results: formattedReviews.length,
    data: { formattedReviews },
  });
});
//Update a Review
exports.UpdateReview = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { rating, comment } = req.body;
  // Find the review
  let review;
  if (userRole === 'Admin') {
    // If the user is an admin, allow them to update any review for the product
    review = await Review.findOne({ product: productId });
  } else {
    // If the user is not an admin, only allow them to update their own review
    review = await Review.findOne({ product: productId, user: userId });
  }
  if (!review) {
    return next(
      new AppError('You have not reviewed this product or not authorized', 403)
    );
  }
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save({
    new: true,
  });
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  const product = await AC.findById(productId);
  if (stats.length > 0) {
    product.averageRating = stats[0].avgRating;
    product.reviewCount = stats[0].reviewCount;
  } else {
    product.averageRating = 0;
    product.reviewCount = 0;
  }
  await product.save();
  res.status(200).json({
    status: 'success',
    message: 'Review Updated Successfully',
    data: { review },
  });
});
//Delete a Review
exports.DeleteReview = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;
  const review = await Review.findOne({ product: productId, user: userId });
  if (!review) {
    return next(
      new AppError('You have not reviewed this product or not authorized', 403)
    );
  }
  if (review.user.toString() !== userId && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this review', 403));
  }
  await review.deleteOne();
  res.status(204).json({
    status: 'success',
    message: 'Review Deleted Successfully',
    data: null,
  });
});
//Like a review
exports.LikeReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(
      new AppError(
        'There is no Review with this ID.Please try again later',
        400
      )
    );
  }
  if (!review.likes) review.likes = [];
  if (!review.dislike) review.dislike = [];
  review.dislike = review.dislike.filter((id) => id.toString() !== userId);

  const alreadyLiked = review.likes.includes(userId);
  if (alreadyLiked) {
    review.likes = review.likes.filter((id) => id.toString() !== userId);
  } else {
    review.likes.push(userId);
  }
  await review.save();
  res.status(200).json({
    status: 'success',
    message: alreadyLiked ? 'Like Removed' : 'Review Liked Successfully',
    data: { review },
  });
});
//Dislike a review
exports.DislikeReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(
      new AppError(
        'There is no Review with this ID.Please try again later',
        400
      )
    );
  }
  if (!review.likes) review.likes = [];
  if (!review.dislike) review.dislike = [];
  review.likes = review.likes.filter((id) => id.toString() !== userId);
  const alreadyDisliked = review.dislike.includes(userId);
  if (alreadyDisliked) {
    review.dislike = review.dislike.filter((id) => id.toString() !== userId);
  } else {
    review.dislike.push(userId);
  }
  await review.save();
  res.status(200).json({
    status: 'success',
    message: alreadyDisliked
      ? 'Dislike Removed'
      : 'Review Disliked Successfully',
    data: { review },
  });
});
