const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const middleware = require('../middleware');

// Follow Route
router.post('/follow/:following/:currentUser', middleware.isLoggedIn, async (req, res) => {
    try {
		const { following, currentUser } = req.params;
        // const followerId = req.user.id;
        const _currentUser = await User.findOne({ username: currentUser});
        const _following = await User.findOneAndUpdate({ username: following }, { $addToSet: { followers: _currentUser._id } });
		// const user = await User.findOneAndUpdate({ username: username }, { $addToSet: { followers: followerId } });

        // Create a notification for the user being followed
		await Notification.create({
            recipient: _following._id,
            sender: _currentUser._id,
            type: 'follow',
            message: `${currentUser} started following you.`
        });

        res.status(200).send({ message: 'Followed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

// Unfollow Route
router.post('/unfollow/:following/:currentUser', middleware.isLoggedIn, async (req, res) => {
    try {
        const { following, currentUser } = req.params;

        const _currentUser = await User.findOne({ username: currentUser});
        const _following = await User.findOneAndUpdate({ username: following }, { $pull: { followers: _currentUser._id } });

        // Delete the 'follow' notification
        await Notification.findOneAndDelete({
            recipient: _following._id,
            sender: _currentUser._id,
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
        console.log("Inside notifications route");
        const userAddress = req.query.userAddress; 

        console.log("[notifications] userAddress : ", userAddress);

        const user = await User.findOne({ username: userAddress });
        
        // Fetch unread notifications for the current user
        const notifications = await Notification.find({ recipient: user._id, read: false }).sort({ createdAt: -1 });
        
        res.status(200).send(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

module.exports = router;