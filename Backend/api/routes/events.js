const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Event = require('../models/events')

// Gets all of the events currentlly selling tickets
router.get('/', (req, res, next) => {
	Event.find().exec().then(docs => {
		console.log(docs)
		if(docs.length > 0) {
			res.status(200).json(docs)
		}
		else res.status(404).json({ message: 'No entries available' })
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err })
	})
})

// Gets a specified event's details
router.get('/:eventId', (req, res, next) => {
	const id = req.params.eventId
	Event.findById(id).exec().then(doc => {
		console.log('From database:', doc)
		if(doc){
			res.status(200).json(doc)
		}
		else res.status(404).json({ message: 'No valid entry found for the ID provided' })
	}).catch(err => {
		console.log(err)
		res.status(500).json({error: err})
	})
})

// Creates a new event and saves appropriate information to the database
router.post('/', (req, res, next) => {
	const event = new Event({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		contractAddress: req.body.contractAddress,
		organiserID: req.body.organiserID,
		organiserAddress: req.body.organiserAddress,
		totalSupply: req.body.totalSupply
	})
	
	event.save().then(result => {
		console.log(result)
		res.status(201).json({
			message: 'Handling POST requests to /events',
			createdEvent: event
		})
	}).catch(err => {
		console.log(err)
		res.status(500).json({
			error: err
		})
	})
})

// Allows an event organiser to update an event's details in the database
router.put('/:eventId', (req, res, next) => {
	const id = req.params.eventId
	const props = req.body;

	Event.update({_id: id}, props).exec().then(result => {
		console.log(result)
		res.status(200).json(result)
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err })
	})
})

// Allows an event organiser to cancel and delete an event from the database
router.delete('/:eventId', (req, res, next) => {
	const id = req.params.eventId
	Event.remove({ _id: id }).exec().then(result => {
		res.status(200).json(result)
	}).catch(err => {
		console.log(err)
		res.status(500).json({ error: err })
	})
})

module.exports = router