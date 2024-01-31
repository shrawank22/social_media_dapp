require('dotenv').config();

const express = require("express");
const expressSanitizer = require('express-sanitizer');
const cors = require('cors')
const passport = require('passport');
const localStrategy = require('passport-local');

const app = express();

//App config
const options = {
    credentials: true,
    origin: "http://localhost:5173",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
};
app.use(cors(options));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

//DB Models exports
const User = require('./models/User');

//routes imported
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const gatekeeperRoutes = require('./routes/gatekeeper')

//DB Connection
const connectMongo = require('./connect');
connectMongo();

// Express session and connect-mongo config --------------
const session = require('express-session');
const MongoStore = require('connect-mongo');

const secret = process.env.SECRET || "Why should I tell you?"

const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", (e) => {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

// app.use(require("express-session")({
// 	secret: "Why should I tell you?",
// 	resave: false,
// 	saveUninitialized: false,
// 	cookie: {
//         httpOnly: true,
//         // secure: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }  
// }));


// Passport config----------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.user = req.user;
    next();
});

//imported routes use
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", gatekeeperRoutes)

//app listen config
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || "0.0.0.0";
app.listen(PORT, IP, () =>
    console.log(`Server started on http://localhost:${PORT}`)
);
