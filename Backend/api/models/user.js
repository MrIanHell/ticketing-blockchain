const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

// This user schema will describe how our "table" (doc) will be structured
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: String, required: true },
    accAddress: {type: String, required: true},
    accPrivKey: {type: String, required: true}
})

module.exports = mongoose.model('User', userSchema)