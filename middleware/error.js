const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Log console for the dev
	console.log('🚀 ~ file: error.js ~ line 9 ~ errorHandler ~ err', err);
	// Mongoogse bad ObjectId
	if (err.name === 'CastError') {
		const message = `Resource not found`;
		error = new ErrorResponse(message, 404);
	}

	// Mongoose duplicat key
	if (err.code === 11000) {
		const message = 'Duplicate field value entered';
		error = new ErrorResponse(message, 400);
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		console.log('validation erro');
		// array of objects
		let message = Object.values(err.errors).map((val, index) => val.message);
		message = message.toString().split(',').join(', ');

		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
	});
};

module.exports = errorHandler;
