const bcrypt = require("bcrypt");
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
		delete result.password;
		return res.status(200).json(result);
	}),
	signin: wpr(async (req, res, next) => {
		const {email, password} = req.body;
		if(!password)
			throw new customError(400, "Senha não informada.");
		const result = await usersModel.find({email});
		result.forEach(obj => {
			if (bcrypt.compareSync(password, obj.password) == true)
				return res.status(200).json(obj);
		});
		throw new customError(404, "Usuário não cadastrado ou credenciais incorretas.");
	}),
};
