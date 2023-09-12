const mongoose = require("mongoose");

class customError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
	}
}

const errorHandler = (err, req, res, next) => {
	if(err instanceof customError)
		return res.status(err.statusCode).json({err.message});

	if(err instanceof mongoose.Error.ValidatorError)
		return res.status(err.statusCode).json({err.message});

	return res.status(500).json({message: "Erro interno de sistema."});
}

module.exports = {errorHandler, customError};
