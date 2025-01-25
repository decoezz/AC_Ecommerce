const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  ac: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AC',
    required: true,
  },
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
  comment: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    deafult: Date.now,
  },
});

reviewSchema.index({ ac: 1 });
reviewSchema.index({ user: 1 });

const review = mongoose.model('Review', reviewSchema);
module.exports = review;
