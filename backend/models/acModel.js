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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    reviewCount: { type: Number, default: 0 },
    photos: [{ type: String, required: true }], // Array of image URLs
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const AC = mongoose.model('AC', AcModelSchema);
module.exports = AC;
