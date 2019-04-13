const express = require('express')
const path = require('path')
const fs = require('fs')
const Web3 = require('web3')
const Event = require('../models/event')
const User = require('../models/user')
const checkAuth = require('../check-auth')
const contractFunctions = require('../../contractFunctions')

const router = express.Router()
const web3 = new Web3('http://localhost:8545')

// Construct the ABI and bytecode from the local TicketToken contract file for smart contract use
const jsonFilePath = path.join(__dirname, '..', '..', '..', 'Token', 'build', 'contracts', 'TicketToken.json')
const contractJsonContent = fs.readFileSync(jsonFilePath, 'utf8')
const jsonOutput = JSON.parse(contractJsonContent)
const abi = jsonOutput['abi']


// Get tickets held by a specific user
router.get('/', checkAuth, async (req, res, next) => {
	const eventDocs = await Event.find().select('-__v').exec()
	let ticketsOwned = []

	// Search through all events and find tickets that the user owns
	for (let doc of eventDocs){
		let contract = new web3.eth.Contract(abi, doc['contractAddress'])
		let ticketQty = await contract.methods.balanceOf(req.userData.accAddress).call()
		if (ticketQty > 0) {
			ticketsOwned.push({
				eventID: doc['_id'],
				eventName: doc['name'],
				quantityOwned: ticketQty
			})
		}
	}
	res.status(201).json({
		message: 'Tickets owned by ' + req.userData.email,
		tickets: ticketsOwned
	})
})

// Buy ticket(s) from inventory for user who sent the request
router.post('/buy', checkAuth, async (req, res, next) => {
	const eventID = req.body.eventID
	const quantity = req.body.quantity
	const eventObj = await Event.findById(eventID).select('-__v').exec() // Fetch event details

	// Check the event exists
	if (!eventObj) {
		res.status(404).json({ message: 'No valid entry found for the ID provided' })
		return
	}

	const eventDoc = JSON.parse(JSON.stringify(eventObj))
	const contract = new web3.eth.Contract(abi, eventDoc['contractAddress'])
	const organsierAddr = eventDoc['organiserAddress']
	const remainingTickets = await contract.methods.balanceOf(organsierAddr).call()

	// Check there are enough tickets left on sale for quantity requested
	if (remainingTickets < quantity) {
		res.status(400).json({
			message: 'Not enough tickets in stock for the quantity requested'
		})
		return
	}

	// Fetch public and private keys of customer and organiser for transfer of tickets
	const userObj = await User.findById(eventDoc['organiserID']).select('-__v').exec()
	const organiserPrivKey = Buffer.from(JSON.parse(JSON.stringify(userObj))['accPrivKey'], 'hex')
	const consumerAddr = req.userData.accAddress

	// Transfer the tickets requested
	const ticketPrice = await contract.methods.faceValue().call() * quantity// Get face value of ticket
	console.log('Transferring ' + quantity + ' ticket(s) for the event \"' + eventDoc['name'] + '\"...')
	contractFunctions.transferTickets(organsierAddr, consumerAddr,
		organiserPrivKey, quantity, ticketPrice, contract).then(txReceipt => {
			console.log('Transfer complete!')
			res.status(201).json({
				message: 'User (' + req.userData.email + ') has successfully bought ticket(s) for \"' + eventDoc['name'] + '\"!'
			})
		}).catch(err => {
			console.log(err)
			res.status(500).json({
				error: err.toString()
			})
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