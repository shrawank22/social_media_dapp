const mongoose = require('mongoose')

const connectMongo = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB connected successfully");
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectMongo;