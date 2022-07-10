const mongoose = require("mongoose")
const User = new mongoose.Schema({
    name: String,
    surname: String,
    email: String,
    age: Number,
    username: {
        type: String,
        unique: true,
    },
    password: String,
    roles: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'role',
        }
    ],
    verified: Boolean,
})
module.exports = mongoose.model('user', User)