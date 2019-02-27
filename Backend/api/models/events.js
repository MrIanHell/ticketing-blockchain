const mongoose = require('mongoose')

// This events schema will desribe how our "table" (doc) will be structured
const eventsSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	contractAddress: { type: String, required: true },
	organiserID: { type: Number, required: true }, // Need to change later to suit a unique id
	organiserAddress: { type: String, required: true }
})

module.exports = mongoose.model('Events', eventsSchema)