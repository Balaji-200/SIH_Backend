// Bcrypt Package 
const bcrypt = require("bcrypt")

// env package
require('dotenv').config();

// Node Mailer
const nodemailer = require('nodemailer');

// User model
const User = require("../models/UserModel");


// User OTP Verification model
const UserVerification = require("../models/UserVerificationModel");

const { currentDateTime } = require('./DateController');
const { errorMessage,successMessage } = require("./messageController");

// Node Mailer setup
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})

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
            verified: false,
        })
        newUser
            .save()
            .then((result) => {
                // Handle OTP Verification through Email
                sendVerificationEmail(result, res);
            })
    } catch (error) {
        errorMessage(res,error);
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
        let message = "Verification otp is send to your email";
        let data = { userId: _id, email: email }; 
        successMessage(res,message,data);
    } catch (error) {
        errorMessage(res,error);
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
            console.log(userVerificationRecord);
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
                        successMessage(res,message,'');
                    } else {
                        let message = "OTP does match, please try again";
                        errorMessage(res,message);
                    }
                }
            }
        }
    } catch (error) {
        errorMessage(error);
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
        errorMessage(error);
    }
}

// LoginUser
const userLogin = async (req, res) => {
    const { username, password } = await req.body;
    try {
        let user = await User.findOne({ username });
        const passwordCompare = bcrypt.compare(password, user.password)
        if (!user || !passwordCompare) {
            let message = "Try to login with correct credentials";
            errorMessage(res,message);
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        let message = "Login Successfull";
        let toSendData = { authToken: authToken };
        successMessage(res,message, toSendData);
    } catch (error) {
        errorMessage(res,error);
    }
}

module.exports = {
    registerUser: registerUser,
    verifyOtp: verifyOtp,
    resendOtp: resendOtp,
    userLogin: userLogin,
}