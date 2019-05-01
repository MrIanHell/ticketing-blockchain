const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const eventRoutes = require('./api/routes/events')
const ticketRoutes = require('./api/routes/tickets')
const authRoutes = require('./api/routes/auth')

const mongoAddress = process.env.MONGO_ADDRESS || "mongodb://localhost:27017/ticketing"
mongoose.connect(mongoAddress, { useNewUrlParser: true })

app.use(morgan('dev')) // Logs requests from clients sent to the console 

// Parses incoming URL and JSON requests to make them easily readable
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Esnuring we prevent CORS errors and allow certain headers/methods for the client
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	)
	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
		return res.status(200).json({})
	}
	next()
})

app.use('/events', eventRoutes)
app.use('/tickets', ticketRoutes)
app.use('/auth', authRoutes)

// Error handling from something the client inputs
app.use((req, res, next) => {
	const error = new Error('Not found')
	error.status = 404
	next(error)
})

// Error handling when something from our system goes wrong (e.g corrupt database)
app.use((error, req, res, next) => {
	res.status(error.status || 500)
	res.json({
		error: {
			message: error.message
		}
	})
})

module.exports = app