const AppError = require('../utils/Error Handeling utils/appError');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const AC = require('../models/acModel');
const {
  validateProductData,
} = require('../utils/Data Validation utils/validateProductData');
const checkProductExists = require('../utils/checkProductExists');
const {
  validateUpdateProduct,
} = require('../utils/Data Validation utils/validateUpdateProduct');
const User = require('../models/userModel');
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
  const productId = req.params.productId;
  const product = await AC.findById(productId).populate('ratings.user');
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  // Calculate average rating
  const averageRating = product.ratings.length
    ? product.ratings.reduce((acc, review) => acc + review.rating, 0) /
      product.ratings.length
    : 0;
  const likesCount = product.likes.length || 0;
  res.status(200).json({
    status: 'success',
    data: {
      product: {
        ...product.toObject(), // Spread the original product fields
        averageRating,
        likesCount,
      },
    },
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
exports.addRating = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const { rating } = req.body;
  const userId = req.user.id;
  const product = await AC.findById(productId);
  if (!product) {
    return next(new AppError('No Product found with this ID', 400));
  }
  //Check if the user has already reviewed this product
  const existingReview = product.ratings.find(
    (rating) => rating.user.toString() === userId
  );
  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }
  product.ratings.push({
    user: userId,
    rating,
  });
  // Recalculate average rating
  const averageRating =
    product.ratings.length > 0
      ? product.ratings.reduce((acc, review) => acc + review.rating, 0) /
        product.ratings.length
      : 0;
  product.averageRating = averageRating;
  await product.save();
  res.status(201).json({
    status: 'success',
    message: 'Rating Added Successfully',
    data: { review: { rating } },
  });
});
//Update a Review
exports.UpdateRating = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;
  const { rating } = req.body;
  const product = await AC.findById(productId);
  const review = product.ratings.find(
    (ratingObj) => ratingObj.user.toString() === userId
  );
  if (!review) {
    return next(new AppError('You have not reviewed this product yet', 404));
  }
  // Update the review rating
  review.rating = rating;
  // Recalculate the average rating and review count
  const stats = product.ratings.reduce(
    (acc, ratingObj) => {
      acc.totalRating += ratingObj.rating;
      acc.reviewCount += 1;
      return acc;
    },
    { totalRating: 0, reviewCount: 0 }
  );
  product.averageRating = stats.totalRating / stats.reviewCount;
  product.reviewCount = stats.reviewCount;
  await product.save();
  res.status(200).json({
    status: 'success',
    message: 'Review Updated Successfully',
    data: { review },
  });
});
//Delete a Review
exports.DeleteRating = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;
  const product = await AC.findById(productId);
  const reviewIndex = product.ratings.findIndex(
    (ratingObj) => ratingObj.user.toString() === userId
  );
  if (reviewIndex === -1) {
    return next(
      new AppError('You have not reviewed this product or not authorized', 403)
    );
  }
  // Remove the review from the ratings array
  product.ratings.splice(reviewIndex, 1);

  // Recalculate average rating and review count
  const stats = product.ratings.reduce(
    (acc, ratingObj) => {
      acc.totalRating += ratingObj.rating;
      acc.reviewCount += 1;
      return acc;
    },
    { totalRating: 0, reviewCount: 0 }
  );
  product.averageRating = stats.totalRating / stats.reviewCount;
  product.reviewCount = stats.reviewCount;

  await product.save();
  res.status(204).json({
    status: 'success',
    message: 'rating Deleted Successfully',
    data: null,
  });
});
//Like a review
exports.LikeProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;
  const product = await AC.findById(productId);
  const user = await User.findById(userId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const alreadyLiked = product.likes.includes(userId);
  if (alreadyLiked) {
    // If already liked, remove like
    product.likes = product.likes.filter((id) => id.toString() !== userId);
    user.likedProducts = user.likedProducts.filter(
      (likedProductId) => likedProductId.toString() !== productId
    );
  } else {
    product.likes.push(userId);
    user.likedProducts.push(productId);
  }
  await product.save();
  await user.save();
  res.status(200).json({
    status: 'success',
    message: alreadyLiked ? 'Like Removed' : 'Product Liked Successfully',
    data: { product },
  });
});
