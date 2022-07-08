const express = require('express')
const router = express.Router()


// user controller
const authController = require('../controllers/AuthController')

// validations 
const { registrationAuthRules, validateRegistration,loginAuthRules, validateLogin } = require('../validations/userValidations')

// validate Token
const validateToken = require('../validations/tokenValidation')

// creating new user
router.post("/create_user",registrationAuthRules(),validateRegistration, authController.registerUser)

// verify email
router.post("/verifyOTP", authController.verifyOtp)

// resend verification
router.post("/resendOTPVerification", authController.resendOtp)

// login user
router.post("/login_user",loginAuthRules(), validateLogin, authController.userLogin)

//user profile
router.get("/profile",validateToken,authController.userProfile)

// add roles
router.post("/add_role", authController.addRole)

module.exports = router