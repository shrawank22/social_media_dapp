const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');


// router.get('/register', (req, res) => {
//     res.render('register');
// });

router.get('/', (req, res) => {
    res.send("dsghfkdsfjkdsf")
})

router.post('/register', async (req, res) => {
    try {
        const user = await User.register(new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            avatar: req.body.avatar
        }), req.body.password);

        passport.authenticate("local")(req, res, () => {
            req.flash('success', "Welcome to App " + user.username);
            res.redirect('/')
        });
    } catch (err) {
        req.flash('error', err.message);
        // return res.redirect('/register');
    }

});

// router.get('/login', (req, res) => {
//     res.render('login');
// });

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
        failureFlash: true,
        successFlash: "Welcome to App, " + req.body.username + "!"
    })(req, res);
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash("success", "Successfully Logged you out");
    res.redirect('/');
});

module.exports = router;