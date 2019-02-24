const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

const eventRoutes = require('./api/routes/events')
const orderRoutes = require('./api/routes/orders')

app.use(morgan('dev')) // Logs requests from clients sent to the console 

// Parses incoming URL and JSON requests to make them easily readable
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/events', eventRoutes)
app.use('/orders', orderRoutes)

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
		error : {
			message: error.message
		}
	})
})

module.exports = app