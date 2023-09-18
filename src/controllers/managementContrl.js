const wpr = require("../wrappers/nextWpr");
const {customError} = require("../wrappers/errorWpr");
const managementModel = require("../models/managementModel");

module.exports = {
	getTravels: wpr(async (req, res) => {
		const result = await managementModel.find({});
		return res.status(200).json(result);
	}),
	postTravel: wpr(async (req, res) => {
		const {
			destiny,
			date,
			departureTime,
			arrivalTime,
			price,
			seatsAvailable,
			scheduled
		} = req.body;
		const {_id} = req.user;

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

		return res.status(200).json(result);
	}),
	changeScheduledStatus: wpr(async (req, res) => {
		const {_id, scheduled} = req.body;

		const result = await managementModel.findByIdAndUpdate(_id, {scheduled: !scheduled}, {
			new: true,
			runValidators: true
		});
		return res.status(200).json(result);
	}),
	reschedule: wpr(async (req, res) => {
		const {_id} = req.params;
		const updatedData = req.body;

		const updatedResource = await managementModel.
			findByIdAndUpdate(
				_id,
				updatedData, {
				new: true,
				runValidators: true
				});

		return res.status(200).json(updatedResource);
	}),
	reserve: wpr(async (req, res) => {
		const {numSeatsToReserve} = req.body;
		const {_id} = req.params;

		if(2 < numSeatsToReserve)
			throw new customError(403, 'O número máximo de cadeiras que podem ser reservadas é 2.');

		const session = await managementModel.startSession();
		let resultTransaction = {};

		// TODO: should I do this with aggregate?
		await session.withTransaction(async () => {
			try {
				const { seatsAvailable } = await managementModel.findById(_id);
				const newSeatsAvailable = seatsAvailable - numSeatsToReserve;

				if (newSeatsAvailable < 0)
					throw new customError(403, 'Não existe número suficiente de cadeiras para serem reservadas.');

				resultTransaction = await managementModel.findByIdAndUpdate(_id, { seatsAvailable: newSeatsAvailable }, {
					new: true,
					runValidators: true
				});
			} catch (err) {
				session.endSession();
				throw err;
			}
		});
		session.endSession();

		return res.status(200).json(resultTransaction);
	}),
};
