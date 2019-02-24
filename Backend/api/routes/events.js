const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
	res.status(200).json({
		message: 'Handling GET requests to /events'
	})
})

router.post('/', (req, res, next) => {
	const event = {
		name: req.body.name,
		faceValue: req.body.price,
		ticketQuantity: req.body.quantity
	}

	res.status(200).json({
		message: 'Handling POST requests to /events'
		createdEvent: event
	})
})

router.get('/:eventId', (req, res, next) => {
	const id = req.params.eventId
	if(id == 'special') {
		res.status(200).json({
			message: 'You discovered the special ID',
			id: id
		})
	} else {
		res.status(200).json({
			message: 'You passed an ID'
		})
	}
})


router.put('/:eventId', (req, res, next) => {
	res.status(200).json({
		message: 'Updated product!'
	})
})

router.delete('/:eventId', (req, res, next) => {
	res.status(200).json({
		message: 'Deleted product!'
	})
})


module.exports = router