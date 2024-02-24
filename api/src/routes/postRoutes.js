const express = require('express');
const router = express.Router();
const middleware = require('../../middleware');
const Post = require('../models/Post');


router.get('/posts/:id', async (req, res) => { 
    try {
        const posts = await Post.find({NFTID: req.params.id});
        if (!posts.length) return res.status(404).send("No Post Found")
        res.json(posts)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.post('/posts', async (req, res) => {
    try {
        let { NFTID, uniqueID } = req.body;
        NFTID = req.sanitize(NFTID);
        uniqueID = req.sanitize(uniqueID);

        const post = await Post.create({NFTID, uniqueID});
        res.send(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({NFTID: req.params.id});
        if (!post) {
            return res.status(404).send('Post not found!')
        }
        res.status(200).send("Post Deleted Successfully")
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
})

module.exports = router

// Get Route /api/posts -> Login required
// router.get('/posts', middleware.isLoggedIn, async (req, res) => {
//     try {
//         const posts = await Post.find({ 'author.id':req.user._id });
//         // console.log(posts);
//         if (!posts) return res.status(404).send("No Post Found")
//         res.json(posts)
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// })
 
// // Add Post Route /api/posts
// router.post('/posts', middleware.isLoggedIn, async (req, res) => {
//         try {
//             let { title, description, tag } = req.body;
//             title = req.sanitize(title);
//             description = req.sanitize(description);
//             tag = req.sanitize(tag);
            
//             const author = {id: req.user._id, username: req.user.username};

//             const post = await Post.create({title, description, tag, author});
//             res.send(post);

//         } catch (error) {
//             console.error(error.message);
//             res.status(500).send("Internal Server Error");
//         }
//     })

// // Update a Post Route "/api/posts/:id" -> Post Ownership required
// router.put('/posts/:id', middleware.checkPostOwnership, async (req, res) => {
//     const { title, description, tag } = req.body;
//     try {
//         const post = await Post.findByIdAndUpdate(req.params.id, {title, description, tag});
//         res.json(post);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// })

// // Delete Post Route "/api/posts/:id"
// router.delete('/posts/:id', middleware.isLoggedIn, async (req, res) => {
//     try {
//         const post = await Post.findByIdAndDelete(req.params.id);
//         if (!post) {
//             return res.status(404).send('Post not found!')
//         }
//         res.status(200).send("Post Deleted Successfully")
//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).send("Internal Server Error");
//     }
// })
// module.exports = router