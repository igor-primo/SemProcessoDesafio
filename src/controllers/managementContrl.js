const wpr = require("../wrappers/nextWpr");
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

		const result = await managementModel.create({
			destiny,
			date,
			departureTime,
			arrivalTime,
			price,
			seatsAvailable,
			scheduled
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
};
