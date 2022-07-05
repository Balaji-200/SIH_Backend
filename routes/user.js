const express = require('express')
const router = express.Router()

// jwt secret
const JWT_SECRET = "secretforpractise"

// initialize jwt
var jwt = require('jsonwebtoken');

// user controller
const authController = require('../controllers/AuthController')

// validations 
const { registrationAuthRules, validateRegistration,loginAuthRules, validateLogin } = require('../validations/userValidations')

// creating new user
router.post("/create_user",registrationAuthRules(),validateRegistration, authController.registerUser)

// verify email
router.post("/verifyOTP", authController.verifyOtp)

// resend verification
router.post("/resendOTPVerification", authController.resendOtp)

// login user
router.post("/login_user",loginAuthRules(), validateLogin, authController.userLogin)

module.exports = router