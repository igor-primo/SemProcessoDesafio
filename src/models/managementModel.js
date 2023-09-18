const mongoose = require("mongoose");

const managementSchema = new mongoose.Schema({
	destiny: {
		type: String,
		required: [true, "Destino deve ser informado."],
		trim: true,
		maxlength: [30, "Endereço de destino não pode exceder 30 caracteres."]
	},
	date: {
		type: Date,
		required: [true, "Data de viagem deve ser informada."],
	},
	departureTime: {
		type: Date,
		required: [true, "O horário de saída deve ser informado."],
	},
	arrivalTime: {
		type: Date,
		required: [true, "O horário de chegada deve ser informado."],
	},
	price: {
		type: String,
		required: [true, "O preço deve ser informado."],
		trim: true,
	},
	seatsAvailable: {
		type: Number,
		required: [true, "O número de cadeiras disponíveis deve ser informado."],
	},
	scheduled: {
		type: Boolean,
		required: [true, "O estado de cancelamento ou agendamento deve ser informado."],
	},
	// In what scenario should I expect a travel to have several managers?
	// I assume there is only one manager for a single TravelManagement document.
	managerUserId: {
		type: mongoose.ObjectId,
		required:  true,
	},
});

module.exports = mongoose.model("TravelManagement", managementSchema);
