const express = require('express')
const path = require('path')
const fs = require('fs')
const Web3 = require('web3')
const mongoose = require('mongoose')
const Event = require('../models/event')
const User = require('../models/user')
const TicketListing = require('../models/ticketListing')
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
router.post('/sellListing', checkAuth, async (req, res, next) => {
	const eventID = req.body.eventID
	const sellPrice = req.body.sellPrice
	const quantity = req.body.quantity
	const sellerAddr = req.userData.accAddress
	const eventObj = await Event.findById(eventID).select('-__v').exec() // Fetch event details
	const eventDoc = JSON.parse(JSON.stringify(eventObj))

	// Validation check to ensure required fields are present in the body request
	if (!eventID || !sellPrice || !quantity) {
		res.status(400).json({
			error: "Please ensure you have sent all required arguments in the body these are: "
				+ "eventID, sellPrice, quantity"
		})
		return
	}

	// Check the event exists
	if (!eventObj) {
		res.status(404).json({ message: 'No valid entry found for the ID provided' })
		return
	}
	
	// Check if the seller owns enough tickets for requested amount to be sold
	const contract = new web3.eth.Contract(abi, eventDoc['contractAddress'])
	const ticketsOwned = await contract.methods.balanceOf(sellerAddr).call()
	if (ticketsOwned < quantity) {
		res.status(403).json({ message: 'Cannot create sell listing as user does not own ' + quantity + ' ticket(s)' })
		return
	}

	// Ensure that proposed sale price isn't higher than the ticket's face value
	const faceValue = await contract.methods.faceValue().call()
	if (sellPrice * 100 > faceValue) {
		res.status(403).json({ message: 'Cannot create sell listing as the sell price is higher than the ticket\'s face value' })
		return
	}

	const ticketListing = new TicketListing({
		_id: new mongoose.Types.ObjectId(),
		eventID: eventID,
		contractAddress: eventDoc['contractAddress'],
		sellPrice: sellPrice,
		sellerID: req.userData.userId,
		sellerAddress: req.userData.accAddress
	})

	// Save sell listing with necessary details to mongoDB
	ticketListing.save().then(result => {
		console.log(result)
		res.status(201).json({
			message: 'Created a sell listing for ' + eventDoc['name'] + ' for the user ' + req.userData.email,
			createdEvent: {
				_id: result._id,
				eventID: result.eventID,
				contractAddress: result.contractAddress,
				sellPrice: result.sellPrice,
				sellerID: result.sellerID,
				sellerAddress: result.sellerAddress,
				request: {
					type: 'GET',
					url: req.protocol + '://' + req.get('host') + '/sellListing/' + result._id
				}
			}
		})
	}).catch(err => {
		console.log(err)
		res.status(500).json({
			error: err.toString()
		})
	})
})


module.exports = router