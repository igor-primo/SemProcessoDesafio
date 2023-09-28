const mongoose = require("mongoose");

class customError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
	}
}

const errorHandler = (err, req, res, next) => {
	const {statusCode, message} = err;
	
	if(err instanceof customError)
		return res.status(statusCode).json({message});

	if(err instanceof mongoose.Error.ValidationError)
		return res.status(400).json({message});

	if(err instanceof mongoose.Error.CastError)
		return res.status(400).json({message: "Erro de validação do banco de dados."});

	return res.status(500).json({message: "Erro interno de sistema."});
}

module.exports = {errorHandler, customError};
