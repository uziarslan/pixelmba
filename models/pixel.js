const mongoose = require('mongoose');

const pixelSchema = new mongoose.Schema({
  pixelUrl: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  pixelColor: {
    type: String,
    required: true,
  },
  pixelIndex: {
    type: Number,
    required: true,
  },
  buyer: {
    email: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
});

module.exports = mongoose.model('Pixel', pixelSchema);
