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

module.exports = {
	getPassage: wpr(async (req, res) => {
		// Gets passage in detail
		const {_id} = req.params;

		const passage = await passageModel.findById(_id);
		const travel = await managementModel.findById(passage.travelId);

		return res.status(200).json({passage, travel});
	}),
	getPassagesFromUser: wpr(async (req, res) => {
		const {_id} = req.user; // user id

		let dataArray = [];

		const passages = await passageModel.find({userId: _id});
		for(let i=0; i<passages.length;i++) {
			const passage = passages[i];
			const travel = await managementModel.findById(passage.travelId);
			dataArray.push({passage, travel});
		}

		return res.status(200).json(dataArray);
	}),
	reserve: wpr(async (req, res) => {
		const {numSeatsToReserve, cardNumber, expirationDate, cvv, paymentMethod} = req.body;

		if(2 < numSeatsToReserve)
			throw new customError(403, 'O número máximo de cadeiras que podem ser reservadas é 2.');

		if(!validateCard(cardNumber, expirationDate, cvv, paymentMethod))
			throw new customError(404, "Pagamento não pôde ser confirmado.");
		
		const {_id} = req.params; // travel id
		const userId = req.user._id;

		const session = await managementModel.startSession();

		let passage = {};
		let confirmationCard = {};

		// TODO: should I do this with aggregate?
		await session.withTransaction(async () => {
			try {
				const { seatsAvailable } = await managementModel.findById(_id);
				const newSeatsAvailable = seatsAvailable - numSeatsToReserve;

				if (newSeatsAvailable < 0)
					throw new customError(403, 'Não existe número suficiente de cadeiras para serem reservadas.');

				const resultTransaction = await managementModel.findByIdAndUpdate(_id, { seatsAvailable: newSeatsAvailable }, {
					new: true,
					runValidators: true
				});

				const amount = resultTransaction.price;
				const travelId = resultTransaction._id;
				passage = await passageModel.create({userId, travelId, scheduled: true});

				const passageId = passage._id;

				const card = {
					transactionDate: new Date().toISOString(),
					merchantName: 'SpaceTravelForReal LTDA.',
					merchantContactNumber: '9999-9999',
					paymentDetails: {
						amount: amount,
						currency: 'Estalecas ($∑)',
						description: 'Esse cartão de confirmação prova que seu possuidor comprou '+numSeatsToReserve+' assentos para viagem espacial.',
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

		return res.status(200).json({passage, confirmationCard});
	}),
	changePassage: wpr(async (req, res) => {
		// I assume that the user will receive a list of available travels by a function
		// implemented in another module. Changing date or destiny can be implemented by
		// changing the reference to travel in the Passages collection.

		// TODO: add filters and pagination to getTravels

		const {_id} = req.body;	// _id of the chosen travel
		const {_idP} = req.params;

		const newPassage = await passageModel.
			findByIdAndUpdate(_idP,
				{ travelId: _id },
				{
					new: true, runValidators: true
				});

		return res.status(200).json(newPassage);
	}),
	cancelPassage: wpr(async (req, res) => {
		const {_id} = req.params;

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
			} catch(err) {
				session.endSession();
				throw err;
			}
		});
		session.endSession();

		return res.status(200).json({passage: newPassage, refundCard});
	}),
};
