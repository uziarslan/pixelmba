const totalPixels = require('../models/total_pixel');

const initializetotalPixels = async () => {
  try {
    const existingGoal = await totalPixels.findOne();
    if (!existingGoal) {
      await totalPixels.create({});
    }
  } catch (error) {
    console.error('Error initializing pixel goal:', error);
  }
};

initializetotalPixels();

module.exports = initializetotalPixels;
