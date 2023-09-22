const bcrypt = require("bcrypt");
const {sign, verify} = require("jsonwebtoken");
const wpr = require("../wrappers/nextWpr.js");
const {customError} = require("../wrappers/errorWpr.js");
const usersModel = require("../models/usersModel.js");

const signup = wpr(async (req, res, next) => {
	/*
	  #swagger.tags = ['Autenticação']
	  #swagger.description = 'Endpoint para autenticação.'
	  #swagger.parameters['object'] = {
	  in: 'body',
	  description: 'Dados para cadastrar usuário.',
	  required: true,
	  type: 'object',
	  schema: { $ref: '#/definitions/user' }
	  }
	  #swagger.responses[201] = {
	  description: 'Usuário cadastrado.',
	  schema: { $ref: '#/definitions/userCreated' }
	  }
	  #swagger.responses[400] = {
	  description: 'Erro de validação de dados de entrada.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const { email, username, password, isManager } =
		req.body;

	if (!password)
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
	return res.status(201).json(resultReal);
});

const signin = wpr(async (req, res, next) => {
	/*
	  #swagger.tags = ['Autenticação']
	  #swagger.description = 'Endpoint para fazer login.'
	  #swagger.parameters['object'] = {
	  in: 'body',
	  description: 'Dados para fazer login.',
	  required: true,
	  type: 'object',
	  schema: { $ref: '#/definitions/loginData' }
	  }
	  #swagger.responses[200] = {
	  description: 'Usuário logado.',
	  schema: { $ref: '#/definitions/userLogged' }
	  }
	  #swagger.responses[400] = {
	  description: 'Erro de validação.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[404] = {
	  description: 'Usuário não pode ser autenticado ou autorizado.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const { email, password } = req.body;

	if (!password)
		throw new customError(404, "Senha não informada.");

	const result = await usersModel.find({ email });
	result.forEach(obj => {
		const objReal = obj.toObject();
		if (bcrypt.compareSync(password, objReal.password) == true) {
			const { _id, isManager } = objReal;
			authToken = sign({ _id, isManager }, process.env.PRIVATE_KEY, { expiresIn: "12h", algorithm: "RS256" });
			objReal.authToken = authToken;

			delete objReal.password;
			return res.status(200).json(objReal);
		}
	});

	throw new customError(404, "Usuário não cadastrado ou credenciais incorretas.");
});

const authenticate = wpr(async (req, res, next) => {
	const authHeader = req.headers['authorization'];

	if (!authHeader)
		throw new customError(404, "Usuário não pôde ser autenticado.");

	const authToken = authHeader.split(" ")[1];

	if (!authToken)
		throw new customError(404, "Usuário não pôde ser autenticado.");

	const decoded = verify(authToken, process.env.PUBLIC_KEY, { algorithms: ["RS256"] });
	const result = await usersModel.findById(decoded._id);

	if (!result)
		throw new customError(404, "Usuário não pôde ser autenticado.");

	req.user = {};
	req.user._id = result._id;
	req.user.isManager = result.isManager;

	next();
});

const authenticateManager = wpr(async (req, res, next) => {
	if (!req.user.isManager)
		throw new customError(404, "Usuário precisa ser gestor para acessar esse recurso.");

	next();
});

module.exports = {
	signup, signin, authenticate, authenticateManager
};
