const bcrypt = require("bcrypt");
const {sign, verify} = require("jsonwebtoken");
const wpr = require("../wrappers/nextWpr.js");
const {customError} = require("../wrappers/errorWpr.js");
const usersModel = require("../models/usersModel.js");

module.exports = {
	signup: wpr(async (req, res, next) => {
		const { email, username, password, isManager } =
			  req.body;

		if(!password)
			throw new customError(400, "Senha não informada.");

		const salt = bcrypt.genSaltSync(10);
		const hashedPass = bcrypt.hashSync(password, salt);
		const result = await usersModel.create({
			email,
			username,
			password: hashedPass,
			isManager
		});

		const resultReal = result.toObject();
		delete resultReal.password;
		return res.status(200).json(resultReal);
	}),
	signin: wpr(async (req, res, next) => {
		const {email, password} = req.body;

		if(!password)
			throw new customError(404, "Senha não informada.");

		const result = await usersModel.find({email});
		result.forEach(obj => {
			const objReal = obj.toObject();
			if (bcrypt.compareSync(password, objReal.password) == true) {
				const _id = objReal._id;
				authToken = sign({_id}, process.env.PRIVATE_KEY, {expiresIn: "12h", algorithm: "RS256"});
				objReal.authToken = authToken;

				delete objReal.password;
				return res.status(200).json(objReal);
			}
		});

		throw new customError(404, "Usuário não cadastrado ou credenciais incorretas.");
	}),
	authenticate: wpr(async (req, res, next) => {
		const authHeader = req.headers['authorization'];
		const authToken = authHeader.split(" ")[1];

		if(!authToken)
			throw new customError(404, "Usuário não pôde ser autenticado.");

		const decoded = verify(authToken, process.env.PUBLIC_KEY, {algorithms: ["RS256"]});
		const result = await usersModel.findById(decoded._id);

		if(!result)
			throw new customError(404, "Usuário não pôde ser autenticado.");

		req.user = {};
		req.user._id = result._id;
		
		next();
	}),
	authenticateManager: wpr(async (req, res, next) => {
		const { _id } = req.user;
		const result = await usersModel.findById(_id).select('isManager');

		const resultData = result.toObject();

		if(!resultData.isManager)
			throw  new customError(404, "Usuário precisa ser gestor para acessar esse recurso.");

		next();
	}),
};
