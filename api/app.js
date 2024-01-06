require('dotenv').config();

const express = require('express');
const bp = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const app = express();

const User = require('./models/user');
const userRoutes = require('./routes/user');


mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("DB connected successfully");
}).catch((err) => {
    console.log(err);
});


app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(bp.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(flash());

app.locals.moment = require('moment');


app.use(require("express-session")({
	secret: "nhi btaunga",
	resave: false,
	saveUninitialized: false,
    cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
	res.locals.user = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(userRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})