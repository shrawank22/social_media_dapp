require('dotenv').config();

const express = require("express");
const expressSanitizer = require('express-sanitizer');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

// App config
const options = {
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
};
app.use(cors(options));

app.use(express.static("public"));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(expressSanitizer());

// Throttle requests to 2 per second
function throttle(requestsPerSecond) {
    const queue = [];
    const intervalMs = 1000 / requestsPerSecond;
    let lastProcessedTime = Date.now();

    function processQueue() {
        const now = Date.now();
        if (queue.length > 0 && now - lastProcessedTime >= intervalMs) {
            const { req, res, next } = queue.shift();
            lastProcessedTime = now;
            next();
        }
        setTimeout(processQueue, 0);
    }

    processQueue();

    return (req, res, next) => {
        queue.push({ req, res, next });
    };
}
// Apply request throttling
// app.use(throttle(2));

// Rate limiting middleware
function rateLimiter(limit, windowMs) {
    const requests = new Map();
    console.log(requests)

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        const requestTimestamps = requests.get(ip) || [];
        const requestsInWindow = requestTimestamps.filter(timestamp => timestamp > windowStart);

        if (requestsInWindow.length >= limit) {
            return res.status(429).json({ message: 'Too many requests, please try again later.' });
        }

        requestTimestamps.push(now);
        requests.set(ip, requestTimestamps);

        next();
    };
}
// Apply rate limiting: 1000 requests per minute
app.use(rateLimiter(10000, 60 * 1000));

// routes imported
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const gatekeeperRoutes = require('./routes/gatekeeper');
const ssiRoutes = require('./routes/ssiRoutes');

// DB Connection
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

// imported routes use
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", gatekeeperRoutes);
app.use("/api", ssiRoutes);

// app listen config
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || "0.0.0.0";
const server = app.listen(PORT, IP, () =>
    console.log(`Server started on http://localhost:${PORT}`)
);

global.io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});