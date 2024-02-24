const mongoose = require('mongoose')

const {Schema, model} = mongoose;

const postSchema = new Schema({
    NFTID: { type: Number, required: true },
    uniqueID: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = model("Todo", postSchema)