require('dotenv').config();

const express = require("express");
const bp = require('body-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const passport = require('passport');
const localStrategy = require('passport-local');
const mongoose = require('mongoose');

const app = express();

//ejs template engine configuration
app.set('view engine', 'ejs');
app.set("views", "views");

//App config
app.use(express.static("public"));
app.use(express.json());
app.use(bp.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//DB Models exports
const Blog = require('./models/Blog');
const User = require('./models/User');

//routes imported
const routes = require('./routes/main');
const userRoutes = require('./routes/user');

//DB Connection
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("DB connected successfully");
}).catch((err) => {
    console.log(err);
});

//passport config
app.use(flash());
app.locals.moment = require('moment');

app.use(require("express-session")({
	secret: "Why should I tell you?",
	resave: false,
	saveUninitialized: false  
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

//imported routes use
app.use(routes);
app.use(userRoutes);

//app listen config
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || "0.0.0.0";
app.listen(PORT, IP, () => 
	console.log(`Server started on http://localhost:${PORT}`)
);
