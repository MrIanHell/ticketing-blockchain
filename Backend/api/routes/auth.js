const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var Web3 = require('web3')
const User = require('../models/user')
const checkAuth = require('../check-auth')

const router = express.Router()
const web3 = new Web3('http://localhost:8545')

// Allows the user to sign-up to the web application
router.post('/signup', (req, res, next) => {
    // Check if a user email exists before creating a new user
    User.findOne({ email: req.body.email }).exec().then(user => {
        // Found a conflict with a current email address stored
        if (user) {
            return res.status(409).json({
                message: 'E-mail already exists'
            })
        } else {
            var ethAccount = web3.eth.accounts.create() // Generate an Ethereum account for the user

            // Hashing the user password with bcrypt to ensure secure storage in mongo
            bcrypt.hash(req.body.password, 10).then(hash => {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash,
                    accAddress: ethAccount.address,
                    accPrivKey: ethAccount.privateKey
                })

                return user.save()
            }).then(result => {
                console.log(result)
                res.status(201).json({
                    message: 'User created'
                })
            }).catch(err => {
                res.status(500).json({
                    error: err
                })
            })
        }
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
            error: err
        })
    })
})

// Allows for a user to delete their account
router.delete('/:userId', checkAuth, (req, res, next) => {
    User.deleteOne({ _id: req.params.userId }).exec().then(result => {
        res.status(200).json({
            message: 'User deleted'
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router