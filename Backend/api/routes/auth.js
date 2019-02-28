const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const router = express.Router()

// Allows the user to sign-up to the web application
router.post('/signup', (req, res, next) => {
    // Check if a user email exists before creating a new user
    User.findOne({ email: req.body.email }).exec().then(user => {
        // Found a conflict with a current email address stored
        if(user){
            return res.status(409).json({
                message: 'E-mail already exists'
            }) 
        } else{
            // Hashing the user password with bcrypt to ensure secure storage in mongo
            bcrypt.hash(req.body.password, 10).then(hash => {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash
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

// Allows for a user to delete their account
router.delete('/:userId', (req, res, next) => {
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