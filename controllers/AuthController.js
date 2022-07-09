// Bcrypt Package 
const bcrypt = require("bcrypt")

// env package
require('dotenv').config();

// initialize jwt
var jwt = require('jsonwebtoken');

// jwt secret
const JWT_SECRET = process.env.JWT_SECRET

const Role = require('../models/RoleModel');

// Node Mailer
const nodemailer = require('nodemailer');

// User model
const User = require("../models/UserModel");

// RoutePermission Model 
const RoutePermission = require("../models/RoutePermissionModel")

// User OTP Verification model
const UserVerification = require("../models/UserVerificationModel");


const { currentDateTime } = require('./DateController');
const { errorMessage,successMessage } = require("./messageController");
const messages = require('../lang/messages.json')
// Node Mailer setup
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})

// register User
const registerUser = async (req, res) => {
    try {
        let { name, surname, email, age, username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            surname,
            age,
            email,
            username,
            password,
            roles:["62c8621cd243f5ceaa9518a1"],
            verified: false,
        })
        newUser
            .save()
            .then((result) => {
                // Handle OTP Verification through Email
                sendVerificationEmail(result, res);
            })
    } catch (error) {
        res.json({"status":"failed","message":error})
    }
}

// sending email
const sendVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        // mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `<p>your otp is </P><strong> ${otp} </strong>`
        }
        const newOtpVerification = await new UserVerification({
            userId: _id,
            otp: otp,
            createdAt: new Date(),
            expiredAt: new Date().setMinutes(new Date().getMinutes() + 10)
        })
        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);
        let data = { userId: _id, email: email }; 
        successMessage(res,messages.successMessages.otpSentSuccess,data);
    } catch (error) {
        res.json({"status":"failed","message":error})
    }

}

// verify OTP
const verifyOtp = async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            let message = "Empty otp details are not allowed";
            errorMessage(res,message);
        } else {
            const userVerificationRecord = await UserVerification.find({ userId: userId });
            if (userVerificationRecord.length <= 0) {
                let message = "Account record not find, please sign up or login";
                errorMessage(res,message);
            } else {
                // check expiry
                const { expiredAt } = userVerificationRecord[0];
                const originalOtp = userVerificationRecord[0].otp;
                if (currentDateTime(expiredAt) < Date.now()) {
                    // otp expired
                    await UserVerification.softDelete({ userId });
                    let message = "OTP has expired , Try to resend it";
                    errorMessage(res,message);
                } else {
                    // success
                    if (otp === originalOtp) {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await UserVerification.softDelete({ userId });
                        let message = "Your email account has been successfully verified.";
                        successMessage(res,message," ");
                    } else {
                        let message = "OTP does match, please try again";
                        errorMessage(res,message);
                    }
                }
            }
        }
    } catch (error) {
        let message = error
        errorMessage(res,message);
    }
}

// ResendOtp
const resendOtp = async (req, res) => {
    try {
        let { userId, email } = req.body;

        // delete present record
        await UserVerification.softDelete({ userId });
        const otpObject = await UserVerification.find({
            userId : userId , 
            createdAt: {
                $lt: new Date(),
                $gt: new Date(new Date().getTime() - 10*60000)
            }, 
            isDeleted : true
        }).count();

        if (!userId || !email) {
            let message = "Empty email details are not allowed";
            errorMessage(res,message);
        } else {
            if (otpObject < 5) {
                sendVerificationEmail({ _id: userId, email }, res)
            } else {
                let message = "OTP LIMIT REACHED . Try After 5 minutes";
                errorMessage(res,message);
            }

        }
    } catch (error) {
        let message = error
        errorMessage(res,message);
    }
}

// LoginUser
const userLogin = async (req, res) => {
    try {
        const { username, password } = await req.body;
        let user = await User.findOne({ username });
        const passwordCompare = bcrypt.compare(password, user.password)
        if (!user || !passwordCompare) {
            let message = "Try to login with correct credentials";
            errorMessage(res,message);
        }
        else{
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET,{ expiresIn: '24h'});
            let message = "Login Successfull";
            successMessage(res,message,authToken);
        }
    } catch (error) {
        res.json({"status":"failed","message":error})
    }
}

// User Profile
const userProfile = async (req,res) => {
    let id = req.userId
    const userDetails = await User.findOne({_id:id},{"_id":0,"roles":0,"verified":0,"__v":0,"password":0})
    res.json({"profileDetails":userDetails})

}

const addRole = async (req,res) => {
    let {name , description , permissions } = req.body;
    const role = new Role({
        name,
        description,
        permissions
    })
    await role
        .save()
        .then(res.json({role:role}))
}

const addRoutePermission = async (req,res) => {
    let {route , permissions } = req.body;
    const routePermission = new RoutePermission({
        route,
        permissions
    })
    await routePermission
        .save()
        .then(res.json({routePermission:routePermission}))
}

module.exports = {
    registerUser: registerUser,
    verifyOtp: verifyOtp,
    resendOtp: resendOtp,
    userLogin: userLogin,
    userProfile:userProfile,
    addRole:addRole,
    addRoutePermission:addRoutePermission,
}