const mongoose = require('mongoose');

const pixelGoalSchema = new mongoose.Schema({
  totalPixels: {
    type: Number,
    default: 12000,
  },
  pixelsBoughtByUsers:{
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('PixelGoal', pixelGoalSchema);
