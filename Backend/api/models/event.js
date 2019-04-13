const mongoose = require('mongoose')

// This events schema will desribe how our "table" (doc) will be structured
const eventSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	date: {	type: Date, required: true },
	contractAddress: { type: String, required: true },
	organiserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	organiserAddress: { type: String, required: true }
})

module.exports = mongoose.model('Event', eventSchema)