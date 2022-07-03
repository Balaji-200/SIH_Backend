const express = require('express')
const router = express.Router()

// jwt secret
const JWT_SECRET = "secretforpractise"

// initialize jwt
var jwt = require('jsonwebtoken');

// for validations
const { body, validationResult } = require('express-validator');

// user controller
const userController = require('../controllers/UserController')

// creating new user
router.post("/create_user", [
    body('name').isLength({ min: 3 }),
    body('surname').isLength({ min: 3 }),
    body('age').isInt(),
    body('email').isEmail().custom(async (email) => {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            throw new Error('Email already in use')
        }
    }),
    body('username').isLength({ min: 6 }),
    body('password').isAlphanumeric().isLength({ min: 6 }),
], userController.createUser)

// verify email
router.post("/verifyOTP", userController.verifyOtp)

// resend verification
router.post("/resendOTPVerification", userController.resendOtp)

// login user
router.post("/login_user", [
    body('username').isAlphanumeric(),
    body('password').isAlphanumeric().isLength({ min: 6 }),
], userController.userLogin)



module.exports = router