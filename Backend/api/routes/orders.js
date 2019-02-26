const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
	res.status(200).json({
		message: 'Orders were fetched!'
	})
})

router.get('/:orderId', (req, res, next) => {
	res.status(201).json({
		message: 'Order details',
		orderId: req.params.orderId
	})
})

router.post('/', (req, res, next) => {
	const order = {
		eventID: req.body.eventID,
		price: req.body.price,
		quantity: req.body.quantity
	}
	res.status(201).json({
		message: 'Order was created!',
		createdOrder: order
	})
})

router.delete('/:orderId', (req, res, next) => {
	res.status(201).json({
		message: 'Order was deleted!',
		orderId: req.params.orderId
	})
})

module.exports = router