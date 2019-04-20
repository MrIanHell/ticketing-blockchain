const express = require('express')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Web3 = require('web3')
const Event = require('../models/event')
const User = require('../models/user')
const contractFunctions = require('../../contractFunctions')
const checkAuth = require('../check-auth')

const router = express.Router()
const web3 = new Web3('http://localhost:8545')

// Construct the ABI and bytecode from the local TicketToken contract file for smart contract use
const jsonFilePath = path.join(__dirname, '..', '..', '..', 'Token', 'build', 'contracts', 'TicketToken.json')
const contractJsonContent = fs.readFileSync(jsonFilePath, 'utf8')
const jsonOutput = JSON.parse(contractJsonContent)
const abi = jsonOutput['abi']
const bytecode = jsonOutput['bytecode']

// Gets all of the events currently selling tickets
router.get('/', (req, res, next) => {
	Event.find().select('-__v').exec().then(docs => {
		const response = {
			numberOfEvents: docs.length,
			events: docs.map(doc => {
				return {
					_id: doc._id,
					name: doc.name,
					description: doc.description,
					date: doc.date,
					contractAddress: doc.contractAddress,
					organiserID: doc.organiserID,
					organiserAddress: doc.organiserAddress,
					request: {
						type: 'GET',
						url: req.protocol + '://' + req.get('host') + '/events/' + doc._id
					}
				}
			})
		}
		if (docs.length > 0) {
			res.status(200).json(response)
		}
		else res.status(404).json({ 
			numberOfEvents: 0,
			events: []
		})
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err.toString() })
	})
})

// Get more details of a specified event
router.get('/:eventId', (req, res, next) => {
	const id = req.params.eventId

	// Validation check for id entered in the URL
	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).json({
			message: 'ID entered in URL is not a valid listing ID'
		})
		return
	}

	Event.findById(id).select('-__v').exec().then(docObj => {
		if (!docObj) {
			res.status(404).json({ message: 'No valid entry found for the ID provided' })
			return
		}
		const doc = JSON.parse(JSON.stringify(docObj))
		const contract = new web3.eth.Contract(abi, doc["contractAddress"])

		contract.methods.faceValue().call().then(faceValue => {
			console.log(faceValue)
			doc["faceValue"] = faceValue / 100
			return contract.methods.totalSupply().call()
		}).then(totalTickets => {
			doc["totalTickets"] = parseInt(totalTickets)
			return contract.methods.balanceOf(doc["organiserAddress"]).call()
		}).then(bal => {
			const ticketsSold = doc["totalTickets"] - bal
			doc["ticketsSold"] = ticketsSold
			res.status(200).json(doc)
		}).catch(err => {
			console.log(err)
			res.status(500).json({ error: err.toString() })
		})

	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err.toString() })
	})
})

// Allows an event organiser to create a new event, save appropriate information to the database and deploy its smart contract
router.post('/', checkAuth, async (req, res, next) => {
	// Fetch organiser details from mongo using the header's user data
	const userObj = await User.findById(req.userData.userId).select('-__v').exec()
	const userDoc = JSON.parse(JSON.stringify(userObj))

	// Initialising variables from request body
	const eventName = req.body.name + ' Ticket'
	const desc = req.body.description
	const organiserAddr = userDoc['accAddress']
	const organiserPrivKey = Buffer.from(userDoc['accPrivKey'], 'hex')
	const date = req.body.date
	const totalSupply = req.body.totalSupply
	const pennyFaceValue = req.body.faceValue * 100

	// Validation check to ensure required fields are present in the body request
	if (!eventName || !desc || !organiserAddr || !organiserPrivKey || !totalSupply || !pennyFaceValue || !date) {
		res.status(400).json({
			error: "Please ensure you have sent all required arguments in the body these are: "
				+ "name, description, totalSupply, faceValue, date"
		})
		return
	}

	// Validate that the date is in the correct format
	const dateRegex = new RegExp("(19|20)[0-9][0-9]-(0[0-9]|1[0-2])-(0[1-9]|([12][0-9]|3[01]))T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]")
	if (!dateRegex.test(date)) {
		res.status(400).json({
			error: "Date entered does not follow this format: YYYY-MM-DDTHH:MM:SS"
		})
		return
	}

	// Deploy the smart contract
	contractFunctions.deployContract(organiserAddr, organiserPrivKey, abi, bytecode, [eventName, totalSupply, pennyFaceValue])
		.then(contract => {
			console.log(req.body.name + ' event smart contract deployed!')

			const event = new Event({
				_id: new mongoose.Types.ObjectId(),
				name: req.body.name,
				description: desc,
				date: new Date(date),
				contractAddress: contract.options.address,
				organiserID: req.userData.userId, // Pull user ID from returned checkAuth response object
				organiserAddress: organiserAddr
			})

			// Save event with necessary details to mongoDB
			event.save().then(result => {
				console.log(result)
				res.status(201).json({
					message: 'Created a new event for ' + req.body.name + ' and deployed its smart contract',
					createdEvent: {
						_id: result._id,
						name: result.name,
						date: result.date,
						contractAddress: result.contractAddress,
						organiserID: result.organiserID,
						organiserAddress: result.organiserAddress,
						request: {
							type: 'GET',
							url: req.protocol + '://' + req.get('host') + '/events/' + result._id
						}
					}
				})
			}).catch(err => {
				console.log(err)
				res.status(500).json({
					error: err.toString()
				})
			})
		}).catch(err => {
			console.log(err)
			res.status(500).json({
				error: err.toString()
			})
		})

})

// Allows an event organiser to update an event's details in the database
router.put('/:eventId', checkAuth, (req, res, next) => {
	const id = req.params.eventId
	const props = req.body;

	Event.update({ _id: id }, props).exec().then(result => {
		console.log(result)
		res.status(200).json({
			message: 'Event updated',
			request: {
				type: 'GET',
				url: req.protocol + '://' + req.get('host') + req.originalUrl
			}
		})
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err.toString() })
	})
})

// Allows an event organiser to cancel and delete an event from the database
router.delete('/:eventId', checkAuth, async (req, res, next) => {
	try {
		const id = req.params.eventId

		// Check the listing exists and that the user that is deleting the listing owns it
		const doc = await Event.findById(id).exec()
		if (!doc) {
			res.status(404).json({ message: 'No valid entry found for the ID provided' })
			return
		}
		if (doc['organiserID'].toString() !== req.userData.userId) {
			res.status(401).json({ message: 'User is not authorised to delete this event as they did not create it' })
			return
		}

		// Remove listing from the database
		await Event.deleteOne({ _id: id }).exec()
		res.status(200).json({
			message: 'Event deleted'
		})

	} catch (err) {
		console.log(err)
		res.status(500).json({ error: err.toString() })
	}
})

module.exports = router