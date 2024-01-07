require('dotenv').config();
const express = require("express");
const Post = require('../models/Post');
const router = express.Router();

const middleware = require('../../middleware');


//Index router
router.get('/', async (req, res) => {
    const posts = await Post.find({});
    res.render('index', { posts: posts });
});


//NEW ROUTE
router.get("/posts/new", middleware.isLoggedIn, (req, res) => {
    res.render("post/new");
});

//CREATE ROUTE
router.post("/posts", middleware.isLoggedIn, async (req, res) => {
    const viewPrice = req.sanitize(req.body.post.viewPrice);
    const content = req.sanitize(req.body.post.content);

    const creator = {
        id: req.user._id,
        username: req.user.username
    };

    try {
        const post = await Post.create({ content: content, viewPrice: viewPrice, creator: creator });
        console.log(post);
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;