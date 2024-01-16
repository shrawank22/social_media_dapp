const mongoose = require('mongoose')

const {Schema, model} = mongoose;

const postSchema = new Schema({
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

module.exports = model("Todo", postSchema)