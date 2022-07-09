const mongoose = require("mongoose");
const Permission = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
    }
);
module.exports = mongoose.model('permission', Permission)