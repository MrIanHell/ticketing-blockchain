const mongoose = require('mongoose')

// This ticket listing schema will describe how our "table" (doc) will be structured
const ticketListingSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	eventID: { type: String, ref: 'Event', required: true },
	contractAddress: { type: String, required: true },
	sellPrice: { type: Number, required: true },
	sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	sellerAddress: { type: String, required: true }
})

module.exports = mongoose.model('ticketListing', ticketListingSchema)