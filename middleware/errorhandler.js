const mongoose = require('mongoose')

const errorHandler = (error, req, res, next) => {
	let statusCode = error.statusCode || 500
	console.log(error);
	let message = error.message || 'Internal Server Error'

	// Mongoose Duplicate Key Error
	if (error.code === 11000) {
		statusCode = 409
		message = `${Object.keys(error.keyValue)} should be unique`
	}

	// Mongoose validation error
	if (error.name === 'ValidationError') {
		statusCode = 400
		message = Object.values(error.errors).map(value => {
			if (value.kind === 'Number') return `${value.path} should be a number`
			return value.message
		}).join('\n');
	}

	console.error(error)

	const isFetch = req.headers['x-requested-with'] === 'XMLHttpRequest'
	if (isFetch)
		res.status(statusCode).json({
			success: false,
			message: message,
		})
	else res.status(statusCode).render('error', { message: message })
}

module.exports = errorHandler