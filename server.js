const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const request = require('request');
require('dotenv').config();
const app = express();
const path = require ("path");
app.use(express.static(path.join(__dirname, "public")));


const PORT = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");

app.use

initializePassport(passport);

// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  res.render("dashboard");
});

app.get("/users/logout", (req, res) => {
  res.render("login.ejs", { message: "You have logged out successfully" });
});

app.get("/users/tasks", (req, res) => {
  res.render("tasks.ejs")
  console.log(req.isAuthenticated());
});

app.get("/users/tracker", (req, res) => {
  res.render("tracker.ejs")
  console.log(req.isAuthenticated());
});

app.get("/users/dashboard", (req, res) => {
  res.render("button")
  console.log(req.isAuthenticated());
});

// app.get("/users/ForgotPass", (req, res) => {
//   res.render("forgotpass.ejs")
// req.logOut();aa
// });


app.post("/users/register", async (req, res) => {
  let {email, password, password2 } = req.body;

  let errors = [];

  console.log({
  
    email,
    password,
    password2
  });

  if (!email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM users WHERE email = $1`, 
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {

            message: "Email already registered"
          });
        } else {
          pool.query(
            `INSERT INTO users (email, password)
                VALUES ($1, $2)
                RETURNING id, password`,
            [email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


