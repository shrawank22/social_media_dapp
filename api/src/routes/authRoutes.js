const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

// Register route----------------
router.post('/register', async (req, res) => {
	const username = req.sanitize(req.body.username);
	const password = req.sanitize(req.body.password);
	const name = req.sanitize(req.body.name);
	const email = req.sanitize(req.body.email);

	try {
		const user = await User.register(new User({ username, name, email }), password);
		// console.log(user);
		req.logIn(user, (err) => {
			if (err) {
				return res.status(500).send(err);
			} else {
				return res.send({user, authtoken: true});
			}
		})

	} catch (err) {
		// console.log(err)
		return res.status(500).send(err.message);
	}
});

// Test Route ----------------------
router.get('/', (req, res) => {
	// console.log(req.user);
	res.json({user: req.user}); 
})

// Login Route ------------------------
router.post('/login', passport.authenticate('local'), (req, res) => {
	res.send({user: req.user, authtoken: true});
	// console.log(req.isAuthenticated());
});


// Logout Route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { 
            return res.status(500).send(err);; 
        } else {
            res.send({message: 'Successfully Logged you out', authtoken: false});
        }
    });
});

module.exports = router;