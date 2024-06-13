if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

//models will go here
require('./models/admin');
require('./models/user');
require('./models/pixel');
require('./models/total_pixel');

const express = require("express");
const MongoDBStore = require("connect-mongo");
const mongoose = require("mongoose");
const multer = require("multer");
const passport = require("passport");
const localStrategy = require("passport-local");
const path = require("path");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const session = require("express-session");
var bodyParser = require("body-parser");

const Admin = mongoose.model('Admin')
const User = mongoose.model('User')

const app = express();
const PORT = 3000;
const mongoURi = process.env.MONGO_URI;
const secret = "heasgge";

// Routes will go here
const adminRoutes = require('./routes/adminRoute');
const userRoutes = require('./routes/userRoute');
const homePageRoute = require('./routes/homePageRoute');
const pixelRoute = require('./routes/pixelRoute');
const stripeRoute = require('./routes/stripeRoute');

 const touchAfterSixMonths = 6 * 30 * 24 * 60 * 60;

const store = new MongoDBStore({
    mongoUrl: mongoURi,
    secret,
    touchAfter: touchAfterSixMonths,
  });
  const sessionConfig = {
    store,
    secret,
    name: "session",
    resave: false,
    saveUninitialized: false,
  };
  
  // Setting up the app
  app.engine("ejs", ejsMate);
  
  app.use(express.static(__dirname + "/public"));
  
  app.set("view engine", "ejs");
  
  app.set(path.join(__dirname, "views"));
  
  app.use(bodyParser.urlencoded({ extended: false }));
  
  app.use(express.urlencoded({ extended: true }));
  
  app.use(bodyParser.json());
  
  app.use(session(sessionConfig));
  
  app.use(passport.initialize());
  
  app.use(passport.session());
  
  app.use(flash());
  
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
  });

  passport.use('admin', new localStrategy(Admin.authenticate()));
  passport.use('user', new localStrategy(User.authenticate()));
  passport.serializeUser((user, done) => {
    if (user instanceof User) {
        done(null, { type: 'user', id: user.id });
    } else if (user instanceof Admin) {
        done(null, { type: 'admin', id: user.id });
    }
});
passport.deserializeUser(async (data, done) => {
  try {
      let user;
      if (data.type === 'user') {
          user = await User.findById(data.id);
      } else if (data.type === 'admin') {
          user = await Admin.findById(data.id);
      }

      // Save the user object in the session regardless of its type
      done(null, user);
  } catch (err) {
      done(err, null);
  }
});



  // initializing Mongoose
  mongoose
    .connect(mongoURi, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
     
    })
    .catch((e) => {
      console.log(e);
    });
  
  const db = mongoose.connection;
  
  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
  
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
  
  app.use(express.json());
  
  //Routes usage will go here
  app.use(adminRoutes);
  app.use(userRoutes);
  app.use(homePageRoute);
  app.use(pixelRoute);
  app.use(stripeRoute);
   // Listen for the port Number
   app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
  });