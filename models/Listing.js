const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
  airbnbId: String,
  url: String,
  title: String,
  description: String,
  images: [{
    url: String,
    description: String,
    seenScore: Number
  }],
  pianoInDescription: Boolean,
  maxSeenScore: Number,
  overallSeenScore: Number,
}, {
  timestamps: true,
});

schema.pre('save', function(next) {
  this.pianoInDescription = [
    this.description,
    ...this.images.map(({ description }) => description),
  ].join('').includes('piano');
  this.maxSeenScore = Math.max(
    ...this.images.map(({ seenScore }) => seenScore)
  );
  this.overallSeenScore = this.pianoInDescription ? 100 : this.maxSeenScore;
  next();
});

const Listing = mongoose.model('Listing', schema, 'listings');
module.exports = Listing;