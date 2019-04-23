const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var Web3 = require('web3')
const User = require('../models/user')
const checkAuth = require('../check-auth')
const contractFunctions = require('../../contractFunctions')

const router = express.Router()
const web3 = new Web3('http://localhost:8545')

// Allows the user to sign-up to the web application
router.post('/signup', (req, res, next) => {

    // Validation check to ensure required fields are present in the body request
    if (!req.body.email || !req.body.password) {
        res.status(400).json({
            error: "Please ensure you have sent all required arguments in the body these are: "
                + "email, password"
        })
        return
    }

    // Check if a user email exists before creating a new user
    User.findOne({ email: req.body.email }).exec().then(user => {
        // Found a conflict with a current email address stored
        if (user) {
            return res.status(409).json({
                message: 'E-mail already exists'
            })
        }
        // Sign the user up and generate a prefunded Ethereum account for them
        else {
            contractFunctions.createPrefundedAccount(100).then(ethAccount => {

                // Hashing the user password with bcrypt to ensure secure storage in mongo
                bcrypt.hash(req.body.password, 10).then(hash => {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        accAddress: ethAccount[0],
                        accPrivKey: ethAccount[1].slice(2)
                    })
                    return user.save()
                }).then(result => {
                    res.status(201).json({
                        message: 'User created'
                    })
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err.toString()
                    })
                })
            }).catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err.toString()
                })
            })
        }
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err.toString()
        })
    })
})

// Allows a user to login
router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }).exec().then(user => {
        if (!user) {
            return res.status(401).json({
                message: 'Authentication failed'
            })
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (!result) {
                return res.status(401).json({
                    message: 'Authentication failed'
                })
            }
            if (result) {
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id,
                    accAddress: user.accAddress
                }, process.env.JWT_KEY, { expiresIn: "12h" })
                return res.status(200).json({
                    message: 'Authentication was successful',
                    token: token
                })
            }
        })

    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err.toString()
        })
    })
})

// Allows for user to check whether they're signed in and provides info on their account
router.get('/', checkAuth, (req, res, next) => {
    res.status(200).json({
        email: req.userData.email,
        userId: req.userData.userId,
        accAddress: req.userData.accAddress
    })
})

// Allows for a user to delete their account
router.delete('/', checkAuth, (req, res, next) => {
    User.deleteOne({ _id: req.userData.userId }).exec().then(result => {
        res.status(200).json({
            message: 'User deleted'
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err.toString()
        })
    })
})

module.exports = router