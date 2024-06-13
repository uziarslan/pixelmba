const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true, 
  },
  verificationToken: {
    type: String,
  },
  
  emailVerified: {
    type: Boolean,
    default: false,
  },
  pixelsBoughtCount: {
    type: Number,
    default: 0,
  },
});

// Use passportLocalMongoose and specify the username field as 'email'
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

module.exports = mongoose.model('User', userSchema);
