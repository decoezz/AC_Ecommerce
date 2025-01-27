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
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
      set: (val) => Math.round(val * 10) / 10, //4.6666,46.666,47,4.7
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
    photos: [{ type: String, required: true }], // Array of image URLs
  },
  { timestamps: true }
);

const AC = mongoose.model('AC', AcModelSchema);
module.exports = AC;
