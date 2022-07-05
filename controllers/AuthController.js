// bcypt 
const bcrypt = require("bcrypt")

// user model
const User = require("../models/UserModel");

// env package
require('dotenv').config();

// verifiaction model
const UserVerification = require("../models/UserVerificationModel");

// nodemailer
const nodemailer = require('nodemailer');

const {currentDateTime} = require('../controllers/DateController')

//nodemailer stuff
let transpoter = nodemailer.createTransport({
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
                // handle verification
                sendVerificationEmail(result, res);
            })
    } catch (error) {
        res.send({ message: error })
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
        await transpoter.sendMail(mailOptions);
        res.json({
            staus: "PENDING",
            message: "Verifaction otp is send to your email",
            data: {
                userId: _id,
                email,
            },
        });
    } catch (error) {
        res.json({
            staus: "FAILED",
            message: error.message,
        });
    }

}

// verify OTP
const verifyOtp = async (req, res) => {
    try {
        let { userId, otp } = req.body;
        console.log(userId);
        console.log(otp);
        if (!userId || !otp) {
            throw Error("Empty otp details are not allowed");
        } else {

            const userVerificationRecord = await UserVerification.find({ userId: userId });
            console.log(userVerificationRecord);

            if (userVerificationRecord.length <= 0) {
                throw new Error("Account record not find, please sign up or login");
            } else {
                // check expiry
                const { expiredAt } = userVerificationRecord[0];
                const originalOtp = userVerificationRecord[0].otp;
                // console.log(originalOtp)
                console.log(currentDateTime(expiredAt))
                console.log(Date.now())
                // console.log(currentDateTime(expiredAt) < Date.now())
                if (currentDateTime(expiredAt) < Date.now()) {
                    // otp expired
                    await UserVerification.softDelete({ userId });
                    throw new Error("OTP has expired , Try to resend it");
                } else {
                    // success
                    if (otp === originalOtp) {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await UserVerification.softDelete({ userId });
                        res.json({
                            status: "VERIFIED",
                            message: "Your email account successfully verified."
                        })
                    } else {
                        throw new Error("OTP does match, please try again");
                    }
                }
            }
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        })
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

        console.log(otpObject);

        if (!userId || !email) {
            throw Error("Empty email details are not allowed");
        } else {
            if (otpObject < 5) {
                sendVerificationEmail({ _id: userId, email }, res)
            } else {
                res.json({
                    staus: "FAILED",
                    message: "OTP LIMIT REACHED . Try After 5 minutes",
                });
            }

        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        })
    }
}

// LoginUser
const userLogin = async (req, res) => {
    const { username, password } = await req.body;
    try {
        let user = await User.findOne({ username });
        const passwordCompare = bcrypt.compare(password, user.password)
        if (!user || !passwordCompare) {
            return res.json({ "message": "Try to login with correct credentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken: authToken, message: "login Successful" })

    } catch (error) {
        res.send({ message: error })
    }
}

module.exports = {
    registerUser: registerUser,
    verifyOtp: verifyOtp,
    resendOtp: resendOtp,
    userLogin: userLogin,
}