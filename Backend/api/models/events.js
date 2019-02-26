const mongoose = require('mongoose')

// This events schema will desribe how our "table" (doc) will be structured
const eventsSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	contractAddress: String,
	organiserID: Number, // Need to change later to suit a unique id
	organiserAddress: String,
	totalSupply: Number
})

module.exports = mongoose.model('Events', eventsSchema)