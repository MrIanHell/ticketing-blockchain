const express = require('express')
const router = express.Router()
const checkAuth = require('../check-auth')


router.get('/', checkAuth, (req, res, next) => {
	res.status(200).json({
		message: 'Tickets were fetched!'
	})
})

router.get('/:ticketId', checkAuth, (req, res, next) => {
	res.status(201).json({
		message: 'Ticket details',
		ticketId: req.params.ticketId
	})
})

router.post('/', checkAuth, (req, res, next) => {
	const ticket = {
		eventID: req.body.eventID,
		price: req.body.price,
		quantity: req.body.quantity
	}
	res.status(201).json({
		message: 'Ticket was created!',
		createdTicket: ticket
	})
})

router.delete('/:TicketId', checkAuth, (req, res, next) => {
	res.status(201).json({
		message: 'Ticket was deleted!',
		ticketId: req.params.ticketId
	})
})

module.exports = router