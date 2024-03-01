const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


router.get('/posts/:id', async (req, res) => { 
    try {
        console.log(req.params.id);
        const posts = await Post.find({
            $or: [
                { NFTID: req.params.id },
                { uniqueID: req.params.id }
            ]
        });
        console.log(posts);
        if (!posts.length) return res.status(404).send("No Post Found")
        res.json(posts)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.post('/posts', async (req, res) => {
    try {
        let { NFTID, uniqueID, ipfsHashes, encryptedFiles } = req.body;
        NFTID = req.sanitize(NFTID);
        uniqueID = req.sanitize(uniqueID);

        const post = await Post.create({NFTID, uniqueID, ipfsHashes, encryptedFiles});
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

