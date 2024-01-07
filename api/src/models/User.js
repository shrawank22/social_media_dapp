const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	name: String,
    email: {type: String, unique: true, required: true},
	avatar: String,
	password: String,
});

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", userSchema);