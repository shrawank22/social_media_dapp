const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const middleware = require('../../middleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register route----------------
router.post('/register', async (req, res) => {
    const username = req.sanitize(req.body.username);
    const password = req.sanitize(req.body.password);
    const name = req.sanitize(req.body.name);
    const email = req.sanitize(req.body.email);

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('A user with this username or email already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
        return res.send({ user, authtoken: token });
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// Login Route ------------------------
router.post('/login', async(req, res) => {
	const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send({ error: 'Invalid username.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid password.' });
        }

        const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
        res.send({ user, authtoken: token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

// Logout Route
// router.get('/logout', middleware.isLoggedIn, (req, res) => {
//     const token = req.headers.authorization.split(' ')[1];
//     const blacklistToken = new TokenBlacklist({ token });
//     blacklistToken.save((err) => {
//         if (err) {
//             return res.status(500).send({ error: 'Logout failed.' });
//         } else {
//             res.send({ message: 'Successfully logged out', authtoken: false });
//         }
//     });
// });

// Follow Route
router.post('/follow/:username', middleware.isLoggedIn, async (req, res) => {
    try {
		const { username } = req.params;
        const followerId = req.user.id;
        const follower = await User.findById(followerId);

		const user = await User.findOneAndUpdate({ username: username }, { $addToSet: { followers: followerId } });

        // Create a notification for the user being followed
		await Notification.create({
            recipient: user._id,
            sender: followerId,
            type: 'follow',
            message: `${follower.username} started following you.`
        });

        res.status(200).send({ message: 'Followed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

// Unfollow Route
router.post('/unfollow/:username', middleware.isLoggedIn, async (req, res) => {
    try {
        const { username } = req.params;
        const followerId = req.user.id;

        const user = await User.findOneAndUpdate({ username: username }, { $pull: { followers: followerId } });

        // Delete the 'follow' notification
        await Notification.findOneAndDelete({
            recipient: user._id,
            sender: followerId,
            type: 'follow'
        });

        res.status(200).send({ message: 'Unfollowed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

// Get Notifications
router.get('/notifications', middleware.isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // Fetch unread notifications for the current user
        const notifications = await Notification.find({ recipient: userId, read: false }).sort({ createdAt: -1 });
        
        res.status(200).send(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

module.exports = router;