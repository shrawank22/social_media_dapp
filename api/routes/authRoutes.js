const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const middleware = require('../middleware');

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