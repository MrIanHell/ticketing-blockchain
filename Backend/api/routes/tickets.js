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
	try {
		const eventDocs = await Event.find().select('-__v').exec()
		let ticketsOwned = []

		// Search through all events and find tickets that the user owns
		for (let doc of eventDocs) {
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
	} catch (err) {
		console.error(err.toString())
		res.status(500).json({
			error: 'Internal Server Error'
		})
	}
})

// Buy ticket(s) from inventory for user who sent the request
router.post('/buy', checkAuth, async (req, res, next) => {
	try {
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
	} catch (err) {
		console.error(err.toString())
		res.status(500).json({
			error: 'Internal Server Error'
		})
	}
})

// Create a sell listing for a user to sell ticket(s)
router.post('/sellListings', checkAuth, async (req, res, next) => {
	try {
		const eventID = req.body.eventID
		const sellPrice = req.body.sellPrice
		const quantity = req.body.quantity
		const sellerAddr = req.userData.accAddress
		const sellerID = req.userData.userId
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

		// Check if owner has other listings and calculate quantity of tickets currently on sale
		// Might replace with Escrow system later...
		const listingObj = await TicketListing.find({ sellerID: sellerID }).exec() // Fetch event details
		const listingDocs = JSON.parse(JSON.stringify(listingObj))
		let ticketQtyOnSale = 0
		for (let doc of listingDocs) {
			ticketQtyOnSale += doc['quantity']
		}

		// Check owner's balance of tickets from the blockchain and subtract that from the quantity they have available to sell
		const contract = new web3.eth.Contract(abi, eventDoc['contractAddress'])
		const ticketsAvailable = (await contract.methods.balanceOf(sellerAddr).call()) - ticketQtyOnSale
		console.log('Tickets available to sell:', ticketsAvailable)
		if (ticketsAvailable < quantity) {
			res.status(403).json({ message: 'Cannot create sell listing as user does not own ' + quantity + ' ticket(s) for the event specified' })
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
			quantity: quantity,
			sellPrice: sellPrice,
			sellerID: sellerID,
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
					quantity: result.quantity,
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
			console.log(err.toString())
			res.status(500).json({
				error: 'Internal Server Error'
			})
		})
	} catch (err) {
		console.error(err.toString())
		res.status(500).json({
			error: 'Internal Server Error'
		})
	}
})

// Gets all of the sell listings
router.get('/sellListings', (req, res, next) => {
	TicketListing.find().select('-__v').exec().then(docs => {
		const response = {
			numberOfListings: docs.length,
			events: docs.map(doc => {
				return {
					_id: doc._id,
					eventID: doc.eventID,
					contractAddress: doc.contractAddress,
					quantity: doc.quantity,
					sellPrice: doc.sellPrice,
					sellerID: doc.sellerID,
					sellerAddress: doc.sellerAddress,
					request: {
						type: 'GET',
						url: req.protocol + '://' + req.get('host') + '/tickets/sellListings/' + doc._id
					}
				}
			})
		}
		if (docs.length > 0) {
			res.status(200).json(response)
		}
		else res.status(404).json({ message: 'No entries available' })
	}).catch(err => {
		console.log(err.toString())
		res.status(500).json({
			error: 'Internal Server Error'
		})
	})
})

// Get a specific sell listing
router.get('/sellListings/:listingId', (req, res, next) => {
	const id = req.params.listingId

	TicketListing.findById(id).select('-__v').exec().then(result => {
		const response = {
			_id: result._id,
			eventID: result.eventID,
			contractAddress: result.contractAddress,
			quantity: result.quantity,
			sellPrice: result.sellPrice,
			sellerID: result.sellerID,
			sellerAddress: result.sellerAddress
		}
		if (result) {
			res.status(200).json(response)
		}
		else res.status(404).json({ message: 'No valid entry found for the ID provided' })
	}).catch(err => {
		console.log(err.toString())
		res.status(500).json({
			error: 'Internal Server Error'
		})
	})
})

// Allows a seller to delete their listing
router.delete('/sellListings/:listingId', checkAuth, async (req, res, next) => {
	try {
		const id = req.params.listingId

		// Check the listing exists and that the user that is deleting the listing owns it
		const doc = await TicketListing.findById(id).exec()
		if (!doc) {
			res.status(404).json({ message: 'No valid listing found for the ID provided' })
			return
		}
		if (doc['sellerID'].toString() !== req.userData.userId) {
			res.status(401).json({ message: 'User is not authorised to delete this listing as they do not own it' })
			return
		}

		// Remove listing from the database
		await TicketListing.remove({ _id: id }).exec()
		res.status(200).json({
			message: 'Listing deleted'
		})

	} catch (err) {
		console.log(err.toString())
		res.status(500).json({
			error: 'Internal Server Error'
		})
	}
})


module.exports = router