//User Model
const User = require('../models/UserModel')
const { body, validationResult } = require('express-validator')

const userValidationRules = () => {
  return [
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
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  else{
    return res.status(400).json({ errors: errors.array() });
  }
}

module.exports = {
  userValidationRules,
  validate,
}