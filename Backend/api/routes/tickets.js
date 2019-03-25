const express = require('express')
const router = express.Router()
const checkAuth = require('../check-auth')

// Get all tickets
router.get('/', checkAuth, (req, res, next) => {
	res.status(200).json({
		message: 'Tickets were fetched!'
	})
})

// Get tickets held by a specific user
router.get('/:ownerId', checkAuth, (req, res, next) => {
	res.status(201).json({
		message: 'Ticket details',
		ticketId: req.params.ticketId
	})
})

// Buy ticket(s) from inventory from user who sent the request
router.post('/buy', checkAuth, (req, res, next) => {
	const ticket = {
		eventID: req.body.eventID,
		price: req.body.price,
		quantity: req.body.quantity
	}
	res.status(201).json({
		message: 'Ticket was bought!',
		createdTicket: ticket
	})
})

// Sell ticket(s) for user who sent the request to another user
router.post('/sell', checkAuth, (req, res, next) => {
	const ticket = {
		eventID: req.body.eventID,
		price: req.body.price,
		quantity: req.body.quantity
	}
	res.status(201).json({
		message: 'Ticket was sold!',
		createdTicket: ticket
	})
})


module.exports = router