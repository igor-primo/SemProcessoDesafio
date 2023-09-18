const wpr = require("../wrappers/nextWpr");
const {customError} = require("../wrappers/errorWpr");
const managementModel = require("../models/managementModel");
const passageModel = require("../models/passageModel");

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
		const {numSeatsToReserve} = req.body;
		const {_id} = req.params;
		const userId = req.user._id;

		if(2 < numSeatsToReserve)
			throw new customError(403, 'O número máximo de cadeiras que podem ser reservadas é 2.');

		const session = await managementModel.startSession();
		let passage = {};

		// TODO: should I do this with aggregate?
		await session.withTransaction(async () => {
			try {
				let resultTransaction = {};
				const { seatsAvailable } = await managementModel.findById(_id);
				const newSeatsAvailable = seatsAvailable - numSeatsToReserve;

				if (newSeatsAvailable < 0)
					throw new customError(403, 'Não existe número suficiente de cadeiras para serem reservadas.');

				resultTransaction = await managementModel.findByIdAndUpdate(_id, { seatsAvailable: newSeatsAvailable }, {
					new: true,
					runValidators: true
				});

				// create passage

				const travelId = resultTransaction._id;
				passage = await passageModel.create({userId, travelId, scheduled: true});
			} catch (err) {
				session.endSession();
				throw err;
			}
		});
		session.endSession();
		// TODO: return confirmation card
		return res.status(200).json(passage);
	}),
	changePassage: wpr(async (req, res) => {
		// I assume that the user will receive a list of available travels by a function
		// implemented in another module. Changing date or destiny can be implemented by
		// changing the reference to travel in the Passages collection.

		// TODO: add filters and pagination to getTravels

		const {_id} = req.body;	// _id of the chosen travel
		const {_idPassage} = req.params;

		const newPassage = await passageModel.
			findByIdAndUpdate(_idPassage,
				{ travelId: _id },
				{
					new: true, runValidators: true
				});

		return res.status(200).json(newPassage);
	}),
	cancelPassage: wpr(async (req, res) => {
		const {_id, scheduled} = req.body;

		const newPassage = await passageModel.
			findByIdAndUpdate(_id,
				{ scheduled: !scheduled },
				{
					new: true, runValidators: true
				});

		return res.status(200).json(newPassage);
	}),
};
