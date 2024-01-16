const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const {Schema, model} = mongoose;

const userSchema = new Schema({
    username: {type: String, unique: true, required: true},
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
    }

});

userSchema.plugin(passportLocalMongoose)

module.exports = model("User", userSchema)
