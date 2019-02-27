const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
	res.status(200).json({
		message: 'Tickets were fetched!'
	})
})

router.get('/:ticketId', (req, res, next) => {
	res.status(201).json({
		message: 'Ticket details',
		ticketId: req.params.ticketId
	})
})

router.post('/', (req, res, next) => {
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

router.delete('/:TicketId', (req, res, next) => {
	res.status(201).json({
		message: 'Ticket was deleted!',
		ticketId: req.params.ticketId
	})
})

module.exports = router