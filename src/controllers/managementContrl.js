const wpr = require("../wrappers/nextWpr");
const {customError} = require("../wrappers/errorWpr");
const managementModel = require("../models/managementModel");

const getTravels = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Viagens']
	  #swagger.description = 'Endpoint para resgatar uma lista de viagens.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação.',
	  required: true,
	  type: 'string',
	  }
	  #swagger.responses[200] = {
	  description: 'Sucesso ao construir lista de viagens.',
	  schema: { $ref: '#/definitions/travelList' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const result = await managementModel.find({});
	return res.status(200).json(result);
});

const postTravel = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Viagens']
	  #swagger.description = 'Endpoint para gestor cadastrar viagens.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.parameters['object'] = {
	  in: 'body',
	  name: 'Travel Data Object',
	  description: 'Objeto com dados da viagem a ser cadastrada.',
	  required: true,
	  type: 'string',
	  schema: { $ref: '#/definitions/travel' }
	  }
	  #swagger.responses[201] = {
	  description: '',
	  schema: { $ref: '#/definitions/travelPosted' }
	  }
	  #swagger.responses[400] = {
	  description: 'Erro de validação dos dados de entrada.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const {
		destiny,
		date,
		departureTime,
		arrivalTime,
		price,
		seatsAvailable,
		scheduled
	} = req.body;
	const { _id } = req.user;

	const result = await managementModel.create({
		destiny,
		date,
		departureTime,
		arrivalTime,
		price,
		seatsAvailable,
		scheduled,
		managerUserId: _id
	});

	return res.status(201).json(result);
});

const changeScheduledStatus = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Viagens']
	  #swagger.description = 'Endpoint para mudar o status de cancelamento ou agendamento de uma viagem.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.parameters['object'] = {
	  in: 'body',
	  description: 'Objeto contendo _id da viagem e o seu estado atual, se agendado ou não (scheduled).',
	  required: true,
	  type: 'object',
	  schema: { $ref: '#/definitions/dataToChangeScheduled' }
	  }
	  #swagger.responses[200] = {
	  description: '',
	  schema: { $ref: '#/definitions/travelPosted' }
	  }
	  #swagger.responses[400] = {
	  description: 'Erro de validação.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const { _id, scheduled } = req.body;

	const result = await managementModel.findByIdAndUpdate(_id, { scheduled: !scheduled }, {
		new: true,
		runValidators: true
	});
	return res.status(200).json(result);
});

const reschedule = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Viagens']
	  #swagger.description = 'Endpoint para remarcar viagem. O usuário precisa ser gestor.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.parameters['object'] = {
	  in: 'body',
	  description: 'Dados a serem modificados. Podem ser date, arrivalTime, departureTime. Pelo menos precisa ser informado.',
	  required: true,
	  type: 'object',
	  schema: { $ref: '#/definitions/rescheduleData' }
	  }
	  #swagger.responses[200] = {
	  description: 'Dados modificados.',
	  schema: { $ref: '#/definitions/travelPosted' }
	  }
	  #swagger.responses[400] = {
	  description: 'Erro de validação.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const { _id } = req.params;
	const {date, arrivalTime, departureTime} = req.body;
	let updatedData = {};

	if(date)
		updatedData.date = date;

	if(arrivalTime)
		updatedData.arrivalTime = arrivalTime;

	if(departureTime)
		updatedData.departureTime = departureTime;

	if(Object.keys(updatedData).length == 0)
		throw new customError(400, "Dados relevantes para remarcação precisam ser fornecidos.");

	const updatedResource = await managementModel.
		findByIdAndUpdate(
			_id,
			updatedData, {
			new: true,
			runValidators: true
		});

	return res.status(200).json(updatedResource);
});

module.exports = {
	getTravels, postTravel, changeScheduledStatus, reschedule
};
