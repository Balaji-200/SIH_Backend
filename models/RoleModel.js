const mongoose = require("mongoose")
const Permission = require('../models/PermissionModel')
const Role = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
      },
      description: {
        type: String,
      },
      permissions: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'permission',
        },
      ],
})

module.exports = mongoose.model('role', Role)