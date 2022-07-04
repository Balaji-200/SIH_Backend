const express = require('express')
const router = express.Router()

// jwt secret
const JWT_SECRET = "secretforpractise"

// initialize jwt
var jwt = require('jsonwebtoken');

// user controller
const userController = require('../controllers/UserController')
const { body, validationResult } = require('express-validator')

// validations 
const { userValidationRules, validate } = require('../validations/userValidations')

// creating new user
router.post("/create_user",userValidationRules(),validate, userController.createUser)

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