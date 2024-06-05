const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const postSchema = new Schema({
    NFTID: String,
    username: String,
    postText: String, 
    viewPrice: String, 
    isDeleted: Boolean, 
    userWhoPaid: [{ type: String }], 
    hasListed: Boolean, 
    listPrice: String, 
    timestampp: {type: Date, default: Date.now}, 
  });


const userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    date: {
        type: Date,
        default: Date.now
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followingPosts: [postSchema]
});

module.exports = model("User", userSchema)
