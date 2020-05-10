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
    objects: [String]
  }],
  containsPiano: Boolean
}, {
  timestamps: true,
});

schema.pre('save', function(next) {
  this.containsPiano = [
    this.description,
    ...this.images.map(({ description, objects }) => [
      description,
      objects
    ].join('')),
  ].join('').includes('piano');
  next();
});

const Listing = mongoose.model('Listing', schema, 'listings');
module.exports = Listing;