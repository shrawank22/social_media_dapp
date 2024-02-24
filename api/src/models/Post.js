const mongoose = require('mongoose')

const {Schema, model} = mongoose;

const postSchema = new Schema({
    NFTID: { type: String, required: true },
    uniqueID: { type: String, required: true },
    ipfsHashes: { type: [], required: true },
    encryptedFiles: { type: [], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = model("Post", postSchema)