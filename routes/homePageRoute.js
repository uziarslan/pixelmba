const express = require('express');
const router = express.Router();
const Pixel = require('../models/pixel');
const totalPixels = require('../models/total_pixel');

const user = require('../models/user');

router.get('/', async (req, res) => {
  res.render('./user_pages/home');
});
router.get('/pixelbuyer', async (req, res) => {
  res.render('./user_pages/pixelbuyer');
});
router.get('/grid',  async (req, res) => {
  pixelData = await Pixel.find();
  tps = await totalPixels.findOne();
  res.render('./user_pages/grid', { tps, pixelData, user: req.user });
});

router.get('/signup', async (req, res) => {
  res.render('./user_pages/signup');
});

router.get('/signin', async (req, res) => {
  res.render('./user_pages/signin');
});



module.exports = router;