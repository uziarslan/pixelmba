// routes/pixelRoute.js
const express = require('express');
const router = express.Router();
const Pixel = require('../models/pixel');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });
const User = require('../models/user');

router.post('/submit_pixel', upload.single('image'), async (req, res) => {
  try {
    const { pixelUrl, pixelColor, pixelIndex } = req.body;
    const image = req.file ? req.file.path : '';

    // Check if the user is logged in
    if (!req.isAuthenticated()) {
      return res.redirect('/user/signin'); // Redirect to the login page if not logged in
    }

    const userId = req.user._id;
 
    // Fetch the user document to get pixelsBoughtCount
    const user = await User.findById(userId);
  
    // Get the limit on the number of pixels based on what the user has bought
    const pixelLimit = user.pixelsBoughtCount;
    
  
    // Create a new Pixel document
    const newPixel = new Pixel({
      pixelUrl,
      image,
      pixelColor,
      pixelIndex,
      buyer: {
        email: req.user.email,
        userId: req.user._id,
      },
    });

    // Save the Pixel document to the database
    await newPixel.save();

    // Update the User document to increment the pixelsBoughtCount
    await User.findByIdAndUpdate(userId, { $inc: { pixelsBoughtCount: -1 } });

    req.flash('success', 'Pixel submitted successfully');
    res.redirect('/grid'); // Redirect to a success page or adjust accordingly
  } catch (error) {
    console.error('Error submitting Pixel:', error);
    req.flash('error', 'Error submitting Pixel');
    res.status(500).json({ message: 'Error submitting Pixel', error: error.message });
  }
});



module.exports = router;
