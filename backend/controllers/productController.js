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
