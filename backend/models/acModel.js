const mongoose = require('mongoose');

const AcModelSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    modelNumber: {
      type: String,
      required: true,
    },
    coolingCapacitiy: {
      type: String,
      required: true,
    },
    powerConsumption: {
      type: Number,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantityInStock: {
      type: Number,
      default: 1,
    },
    unitSold: {
      type: Number,
      deafult: 0,
    },
    reviewCount: { type: Number, default: 0 },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    photos: [{ type: String, required: true }], // Array of image URLs
  },
  { timestamps: true }
);

const AC = mongoose.model('AC', AcModelSchema);
module.exports = AC;
