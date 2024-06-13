
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
const PixelGoal = require('../models/total_pixel');
const User = require('../models/user');

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { quantity } = req.body;

    // Fetch the total pixels information from the database
    const pixelGoal = await PixelGoal.findOne();

    if (!pixelGoal) {
      return res.status(404).json({ message: 'Pixels not found' });
    }
    if (!req.user) {
      return res.redirect('/user/signin');
    }
    const userId = req.user._id;

    // Calculate the unit amount based on the price per pixel (€10)
    const unitAmount = 10 * 100; // Convert to cents

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Pixel', // You can adjust this based on your product details
            },
            unit_amount: unitAmount,
          },
          quantity: quantity || 1,
          adjustable_quantity: {
            enabled: true
          },
        },
      ],
      mode: 'payment',

      success_url: `http://localhost:3000/success?userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    res.status(500).json({ message: 'Error creating Checkout Session', error: error.message });
  }
});

router.get('/success', async (req, res) => {
  try {
    const { session_id, userId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id)
    quantity = session.amount_total / 1000


    // Update the User document to increment the pixelsBoughtCount based on the chosen quantity
    await User.updateOne({ _id: userId }, { $inc: { pixelsBoughtCount: parseInt(quantity) || 1 } });

    // Decrement the totalPixels in PixelGoal based on the chosen quantity
    await PixelGoal.updateOne({}, { $inc: { totalPixels: -parseInt(quantity) || -1 } });
    await PixelGoal.updateOne({}, { $inc: { pixelsBoughtByUsers: parseInt(quantity) || 1 } });

    res.redirect('/grid'); // Render your success page
  } catch (error) {
    console.error('Error updating database on success:', error);
    res.status(500).json({ message: 'Error updating database on success', error: error.message });
  }
});

router.get('/cancel', async (req, res) => {
  res.render('./user_pages/cancel');
});
module.exports = router;

