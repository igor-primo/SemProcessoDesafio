const mongoose = require("mongoose");

class customError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
	}
}

const errorHandler = (err, req, res, next) => {
	
	if(err instanceof customError)
		return res.status(err.statusCode).json({message: err.message});

	const message = Object.values(err.errors).map(val => val.message);

	if(err instanceof mongoose.Error.ValidationError)
		return res.status(400).json({message: message});

	return res.status(500).json({message: "Erro interno de sistema."});
}

module.exports = {errorHandler, customError};
