const express = require('express');
const router = express.Router();
const passport = require('passport');
const Admin = require('../models/admin');
const User = require('../models/user');
const Pixel = require('../models/pixel');
const {isAdmin} = require('../middleware/isAdmin');

// Admin Signup
router.get('/admin/signup', (req, res) => {
  const adminSignupSecret = process.env.ADMIN_SIGNUP_SECRET;
  const querySecret = req.query._secret;
  if (querySecret === adminSignupSecret) {
  
    res.render('./admin_pages/adminSignup');
  } else {
 res.redirect('/')
  }
});

router.post('/admin/signup', async (req, res, next) => {
  const { username, password } = req.body;
  
  try {
    const foundUser = await Admin.findOne({ username });
    if (foundUser) {
        req.flash('error', 'Email already in use. Try different Email or Login instead.')
      return res.redirect('/admin/signup');
    }
    
    const admin = new Admin({ ...req.body });
    
    await Admin.register(admin, password);
    passport.authenticate('admin')(req, res, () => {
      res.redirect('/admin/login');
    });
  } catch (err) {
    next(err);
  }
});

// Admin Login
router.get('/admin/login', (req, res) => {
  res.render('./admin_pages/adminLogin');
});

router.post('/admin/login', passport.authenticate('admin', {
  failureRedirect: '/admin/login',
  failureFlash: {type: 'error', message: 'Invalid Username/Password'}
}), (req, res) => {
   req.flash('success', 'Welcome back, admin!');
  
  res.redirect('/userslist');
});

router.get('/userslist', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'email pixelsBoughtCount');
    // Fetch pixel data including buyer information
    const pixelData = await Pixel.find({ buyer: { $exists: true, $ne: null } })
      .populate('buyer.userId', 'email') 
      .select('pixelUrl image pixelIndex buyer')
      .sort({ pixelIndex: 1 });;

    res.render('./admin_pages/userslist', { users, pixelData });
  } catch (error) {
    console.error('Error fetching users and pixel data:', error);
    req.flash('error', 'Error fetching users and pixel data');
  }
});

router.get('/pixellist', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'email pixelsBoughtCount');
    // Fetch pixel data including buyer information
    const pixelData = await Pixel.find({ buyer: { $exists: true, $ne: null } })
      .populate('buyer.userId', 'email') 
      .select('pixelUrl image pixelIndex buyer pixelColor')
      .sort({ pixelIndex: 1 });;

    res.render('./admin_pages/pixellist', { users, pixelData });
  } catch (error) {
    console.error('Error fetching users and pixel data:', error);
    req.flash('error', 'Error fetching users and pixel data');
  }
});

router.post('/deletePixel/:pixelId', isAdmin, async (req, res) => {
 
  const pixelId = req.params.pixelId;
  try {
    const pixelToDelete = await Pixel.findById(pixelId);
    if (!pixelToDelete) {
      req.flash('error', 'Pixel not found');
      return res.redirect('/userslist');
    }
    const user = await User.findById(pixelToDelete.buyer.userId);
    if (user) {
      user.pixelsBoughtCount += 1;
      await user.save();
    }
    await Pixel.findByIdAndDelete(pixelId);
    req.flash('success', 'Pixel deleted successfully');
    res.redirect('/userslist');
  } catch (error) {
    console.error('Error deleting pixel:', error);
    req.flash('error', 'Internal Server Error');
    res.redirect('/userslist');
  }
});
router.get('/admin/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/admin/login');
  });
});

module.exports = router;