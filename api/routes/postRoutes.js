const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');


router.get('/posts/:id', async (req, res) => {
    try {
        const posts = await Post.find({
            $or: [
                { NFTID: req.params.id },
                { uniqueID: req.params.id }
            ]
        });

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

        const post = await Post.create({ NFTID, uniqueID, ipfsHashes, encryptedFiles });
        res.send(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ NFTID: req.params.id });
        if (!post) {
            return res.status(404).send('Post not found!')
        }
        res.status(200).send("Post Deleted Successfully")
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
})

// new thing
router.get('/topPosts/:username/:limit', async (req, res) => {
    try {
        const { username, limit } = req.params;

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Sort the followingPosts array by timestamp in descending order
        const sortedPosts = user.followingPosts.sort((a, b) => b.timestamp - a.timestamp);

        // Get the total number of posts
        const totalPosts = sortedPosts.length;

        // Calculate the starting index for the last k posts
        const startIndex = Math.max(totalPosts - parseInt(limit), 0);

        // Get the last k posts from the sorted array
        const lastPosts = sortedPosts.slice(startIndex);
        res.status(200).json({ posts: lastPosts });
    } catch (error) {
        console.error('Error fetching top posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// router.get('/topPosts/:username/:limit', async (req, res) => {
//     try {
//       const { username, limit } = req.params;
  
//       // Find the user by username
//       const user = await User.findOne({ username });
  
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       // Sort the followingPosts array by timestamp in descending order
//       const sortedPosts = user.followingPosts.sort((a, b) => b.timestamp - a.timestamp);
  
//       // Get the total number of posts
//       const totalPosts = sortedPosts.length;
  
//       // Calculate the starting index for the last k posts
//       const startIndex = Math.max(totalPosts - parseInt(limit), 0);
  
//       // Get the last k posts from the sorted array
//       const lastPosts = sortedPosts.slice(startIndex);
//       res.status(200).json({ posts: lastPosts });
//     } catch (error) {
//       console.error('Error fetching top posts:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

  router.post('/postsFollowing', async (req, res) => {
    try {
      //const { followerUsername, id, username, postText, viewPrice, isDeleted, userWhoPaid, hasListed, listPrice, timestampp, NFTID, uniqueID, ipfsHashes, encryptedFiles } = req.body;
    const { followerUsername, NFTID, username,  postText,  viewPrice,
      isDeleted, userWhoPaid, hasListed,listPrice } = req.body;

      console.log("req.body : ", req.body);

      // Find the follower user by username
      const followerUser = await User.findOne({ username: followerUsername });
  
      if (!followerUser) {
        return res.status(404).json({ error: 'Follower user not found' });
      }
  
      // Create a new post
      const newPost = {
        NFTID,
        username,
        postText,
        viewPrice,
        isDeleted, userWhoPaid, hasListed,listPrice
      };
      // Update the existing post if NFTID matches, otherwise add a new post
    const updatedUser = await User.findOneAndUpdate(
      { username: followerUsername, 'followingPosts.NFTID': NFTID },
      { $set: { 'followingPosts.$': newPost } },
      { new: true }
    )
    if (!updatedUser) {
      // If no post with matching NFTID found, add a new post to the array
      await User.findOneAndUpdate(
        { username: followerUsername },
        { $push: { followingPosts: newPost } },
        { new: true }
      );
    }
      res.status(201).json({ message: 'Post stored successfully' });

  } 
    catch (error) {
      console.error('Error storing post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/deletePost/:followerUsername/:NFTID', async (req, res) => {
    // console.log(req.params, req.query)
    const { followerUsername, NFTID } = req.params; // Extract params from URL
    try {
        // Find the user and update by pulling the post with the given NFTID from the followingPosts array
        const result = await User.findOneAndUpdate(
          { username: followerUsername },
          { $pull: { followingPosts: { NFTID: NFTID } } },
          { new: true }  // Return the updated document
      );
          console.log("maggga",result); 
      if (!result) {
          return res.status(404).json({ error: "User not found or no post matches the given NFTID." });
      }

      res.status(200).json({ message: "Post deleted successfully", updatedUser: result }); 
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router
