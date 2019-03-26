const express = require('express')
const path = require('path')
const fs = require('fs')
const Web3 = require('web3')
const Event = require('../models/event')
const checkAuth = require('../check-auth')

const router = express.Router()
const web3 = new Web3('http://localhost:8545')

// Construct the ABI and bytecode from the local TicketToken contract file for smart contract use
const jsonFilePath = path.join(__dirname, '..', '..', '..', 'Token', 'build', 'contracts', 'TicketToken.json')
const contractJsonContent = fs.readFileSync(jsonFilePath, 'utf8')
const jsonOutput = JSON.parse(contractJsonContent)
const abi = jsonOutput['abi']

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

// Buy ticket(s) from inventory for user who sent the request
router.post('/buy', checkAuth, (req, res, next) => {
	const eventID = req.body.eventID
	const quantity = req.body.quantity
	Event.findById(eventID).select('-__v').exec().then(docObj => {
		if (!docObj) {
			res.status(404).json({ message: 'No valid entry found for the ID provided' })
			return
		}

		const doc = JSON.parse(JSON.stringify(docObj))
		const contract = new web3.eth.Contract(abi, doc["contractAddress"])
		console.log(req.userData)
	})


	res.status(201).json({
		message: 'Ticket was bought!'
	})
})

// Sell ticket(s) for user who sent the request
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