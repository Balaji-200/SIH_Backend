const mongoose = require("mongoose")
const RoutePermission = new mongoose.Schema({
    route: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'permission',
        },
    ],
})

module.exports = mongoose.model('routePermission', RoutePermission)