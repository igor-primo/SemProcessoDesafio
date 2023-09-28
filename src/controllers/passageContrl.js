const wpr = require("../wrappers/nextWpr");
const {customError} = require("../wrappers/errorWpr");
const managementModel = require("../models/managementModel");
const passageModel = require("../models/passageModel");
const billingModel = require("../models/billingModel");

const validateCard = (cardNumber, expirationDate, cvv, paymentMethod) => {
	// I leave this function to check whether such date is actually given
	// I will leave it mocked
	return cardNumber && expirationDate && cvv && paymentMethod;
}

const getPassage = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Passagens']
	  #swagger.description = 'Endpoint para resgatar dados detalhados de uma passagem específica. Retorna também a viagem associada.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.responses[200] = {
	  description: 'Sucesso ao construir o objeto de passagem.',
	  schema: { $ref: '#/definitions/passageToBeReturned' }
	  }
	  #swagger.responses[400] = {
	  description: 'Erro de validação do _id.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	// Gets passage in detail
	const { _id } = req.params;

	const passage = await passageModel.findById(_id);
	const travel = await managementModel.findById(passage.travelId);

	return res.status(200).json({ passage, travel });
});

const getPassagesFromUser = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Passagens']
	  #swagger.description = 'Endpoint para resgatar passagens de um usuário.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.responses[200] = {
	  description: 'Sucesso ao constuir o vetor de passagens',
	  schema: { $ref: '#/definitions/userPassagesArray' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const { _id } = req.user; // user id

	let dataArray = [];

	const passages = await passageModel.find({ userId: _id });
	for (let i = 0; i < passages.length; i++) {
		const passage = passages[i];
		const travel = await managementModel.findById(passage.travelId);
		dataArray.push({ passage, travel });
	}

	return res.status(200).json(dataArray);
});

const reserve = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Passagens']
	  #swagger.description = 'Endpoint para fazer reserva de viagem, retornando passagem e cartão de confirmação.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string'
	  }
	  #swagger.parameters['object'] = {
	  in: 'body',
	  description: 'Dados de pagamento junto com o número de assentos a se reservar.',
	  required: true,
	  type: 'object',
	  schema: { $ref: '#/definitions/reservationInput' }
	  }
	  #swagger.responses[200] = {
	  description: 'Sucesso ao fazer reserva e confirmar pagamento.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
	  }
	  #swagger.responses[403] = {
	  description: 'Dado validado mas rejeitado pela lógica do sistema.',
	  schema: { $ref: '#/definitions/validationErrorMsg' }
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

	const { numSeatsToReserve, cardNumber, expirationDate, cvv, paymentMethod } = req.body;

	if (2 < numSeatsToReserve || numSeatsToReserve <= 0)
		throw new customError(403, 'O número máximo de cadeiras que podem ser reservadas é 2 e no mínimo 1.');

	if (!validateCard(cardNumber, expirationDate, cvv, paymentMethod))
		throw new customError(400, "Pagamento não pôde ser confirmado.");

	const { _id } = req.params; // travel id
	const userId = req.user._id;

	const session = await managementModel.startSession();

	let passage = {};
	let confirmationCard = {};

	await session.withTransaction(async () => {
		try {
			const { seatsAvailable } = await managementModel.findById(_id);
			const newSeatsAvailable = seatsAvailable - numSeatsToReserve;

			if (newSeatsAvailable < 0)
				throw new customError(403, 'Não existe número suficiente de cadeiras para serem reservadas.');

			/*
			  The challenge is not clear whether a user is supposed to have the total number of passages amounting to
			  2 seats maximum, or whether he/she can have an arbitrary number of passages each of which gives right to 2
			  seats maximum. Since the last case makes no sense, I will try to implement the first interpretation.
			 */

			const existingPassages = await passageModel.find({userId: userId, travelId: _id});

			let totalNumSeatsForUser = 0;
			if(0 < existingPassages.length)
				existingPassages.forEach(passage => {
					totalNumSeatsForUser += passage.numSeatsReserved;
				});

			if(2 <= totalNumSeatsForUser)
				throw new customError(403, "Usuário já possui direito a 2 assentos.");

			const resultTransaction = await managementModel.findByIdAndUpdate(_id, { seatsAvailable: newSeatsAvailable }, {
				new: true,
				runValidators: true
			});

			const amount = resultTransaction.price;
			const travelId = resultTransaction._id;
			passage = await passageModel.create({ userId, travelId, scheduled: true, numSeatsReserved: numSeatsToReserve });

			const passageId = passage._id;

			const card = {
				transactionDate: new Date().toISOString(),
				merchantName: 'SpaceTravelForReal LTDA.',
				merchantContactNumber: '9999-9999',
				paymentDetails: {
					amount: amount,
					currency: 'Estalecas ($∑)',
					description: 'Esse cartão de confirmação prova que seu possuidor comprou ' + numSeatsToReserve + ' assentos para viagem espacial.',
					paymentMethod: paymentMethod,
					billing: null
				},
				message: 'Pagamento realizado com sucesso!',
				passageId: passageId
			};

			confirmationCard = await billingModel.create(card);
		} catch (err) {
			session.endSession();
			throw err;
		}

	});
	session.endSession();

	return res.status(200).json({ passage, confirmationCard });
});

const changePassage = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Passagens']
	  #swagger.description = 'Endpoint para trocar a passagem para uma viagem por outra.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.parameters['object'] = {
	  in: 'body',
	  description: 'Objeto contendo _id da viagem',
	  required: true,
	  type: 'object',
	  schema: { $ref: '#/definitions/passageToBeChanged' }
	  }
	  #swagger.responses[200] = {
	  description: 'Passagem modificada para apontar para outra viagem.',
	  schema: { $ref: '#/definitions/passageToBeReturned' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	// I assume that the user will receive a list of available travels by a function
	// implemented in another module. Changing date or destiny can be implemented by
	// changing the reference to travel in the Passages collection.

	// TODO: fix case in which a person tries to change to a travel with too few seats available
	const { _id } = req.body;	// _id of the chosen travel
	const { _idP } = req.params;

	let newPassage = {}, newTravel = {};

	const session = await passageModel.startSession();

	await session.withTransaction(async () => {
		const passage = await passageModel.findById({_id: _idP});
		const travel = await managementModel.findById(_id);

		const newSeats = travel.seatsAvailable - passage.numSeatsReserved;
		if(newSeats <= 0 && passage.numSeatsReserved != 1)
			throw new customError(404, "Não há assentos disponíveis.");

		// Update seats in previous travel

		let oldTravel = await managementModel.findById({_id: passage.travelId});
		oldTravel.seatsAvailable += passage.numSeatsReserved;
		const available = oldTravel.seatsAvailable;
		await managementModel.findByIdAndUpdate(
			{_id: passage.travelId},
			{seatsAvailable: available}
		);

		// Set seats in actual travel

		await managementModel.findByIdAndUpdate(
			{_id: _id},
			{seatsAvailable: newSeats}
		);

		// Actually update passage

		newPassage = await passageModel.
			findByIdAndUpdate(_idP,
				{ travelId: _id },
				{
					new: true, runValidators: true
				});
		
		newTravel = await managementModel.findById(newPassage.travelId);
	});
	session.endSession();

	return res.status(200).json({passage: newPassage, travel: newTravel});
});

const cancelPassage = wpr(async (req, res) => {
	/*
	  #swagger.tags = ['Passagens']
	  #swagger.description = 'Endpoint para cancelar uma passagem.'
	  #swagger.parameters['jwt'] = {
	  in: 'header',
	  name: 'Authorization',
	  description: 'Token de autenticação',
	  required: true,
	  type: 'string',
	  }
	  #swagger.responses[200] = {
	  description: 'Sucesso ao cancelar passagem e conseguir reembolso.',
	  schema: { $ref: '#/definitions/reserveOutputDataForCancellation' }
	  }
	  #swagger.responses[500] = {
	  description: 'Erro interno de sistema.',
	  schema: { $ref: '#/definitions/internalErrorMsg' }
	  }
	*/

	const { _id } = req.params;

	const session = await passageModel.startSession();

	let newPassage = {};
	let refundCard = {};
	await session.withTransaction(async () => {
		try {
			newPassage = await passageModel.
				findByIdAndUpdate(_id,
					{ scheduled: false },
					{
						new: true, runValidators: true
					});

			const passageId = newPassage._id;
			refundCard = await billingModel.findOneAndUpdate({ passageId: passageId }, { refunded: true }, { new: true, runValidators: true });
		} catch (err) {
			session.endSession();
			throw err;
		}
	});
	session.endSession();

	return res.status(200).json({ passage: newPassage, refundCard });
});

module.exports = {
	getPassage, getPassagesFromUser, reserve, changePassage, cancelPassage
};
