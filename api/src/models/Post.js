const mongoose = require("mongoose")

var postSchema = new mongoose.Schema({
    content: String,
    viewPrice: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Post", postSchema);