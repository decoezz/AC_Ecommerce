const mongoose = require('mongoose');

const AcModelSchema = new mongoose.Schema({
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
    min: 0,
    max: 5,
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
});

const AC = mongoose.model('AC', AcModelSchema);
module.exports = AC;
