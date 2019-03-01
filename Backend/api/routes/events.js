const express = require('express')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Web3 = require('web3')
const Event = require('../models/event')
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
					contractAddress: doc.contractAddress,
					organiserID: doc.organiserID,
					organiserAddress: doc.organiserAddress,
					request: {
						type: 'GET',
						url: req.protocol + '://' + req.get('host') + req.originalUrl + doc._id
					}
				}
			})
		}
		if (docs.length > 0) {
			res.status(200).json(response)
		}
		else res.status(404).json({ message: 'No entries available' })
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err })
	})
})

// Get more details of a specified event
router.get('/:eventId', (req, res, next) => {
	const id = req.params.eventId
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

			console.log('From database:', doc)
			res.status(200).json(doc)
		}).catch(err => {
			console.log(err)
			res.status(500).json({ error: err })
		})

	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err })
	})
})

// Allows an event organiser to create a new event, save appropriate information to the database and deploy its smart contract
router.post('/', checkAuth, (req, res, next) => {
	// Initialising variables from request body
	const eventName = req.body.name + ' Ticket'
	const organiserAddr = req.body.organiserAddress // need to replace this to lookup from mongo
	const organiserPrivKey = Buffer.from(process.env.PRIVATE_KEY_1, 'hex') // need to replace this to lookup from mongo
	const totalSupply = req.body.totalSupply
	const pennyFaceValue = req.body.faceValue * 100

	// Deploy the smart contract
	contractFunctions.deployContract(organiserAddr, organiserPrivKey, abi, bytecode, [eventName, totalSupply, pennyFaceValue])
		.then(contract => {
			console.log(req.body.name + ' event smart contract deployed!')

			const event = new Event({
				_id: new mongoose.Types.ObjectId(),
				name: req.body.name,
				contractAddress: contract.options.address,
				organiserID: req.body.organiserID,
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
						contractAddress: result.contractAddress,
						organiserID: result.organiserID,
						organiserAddress: result.organiserAddress,
						request: {
							type: 'GET',
							url: req.protocol + '://' + req.get('host') + req.originalUrl + result._id
						}
					}
				})
			}).catch(err => {
				console.log(err)
				res.status(500).json({
					error: err
				})
			})
		}).catch(err => {
			console.log(err)
			res.status(500).json({
				error: err
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
		res.status(500).json({ error: err })
	})
})

// Allows an event organiser to cancel and delete an event from the database
router.delete('/:eventId', checkAuth, (req, res, next) => {
	const id = req.params.eventId
	Event.remove({ _id: id }).exec().then(result => {
		res.status(200).json({
			message: 'Event deleted'
		})
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err })
	})
})

module.exports = router