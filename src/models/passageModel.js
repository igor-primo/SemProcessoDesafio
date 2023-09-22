const mongoose = require("mongoose");

const passageSchema = new mongoose.Schema({
	travelId: {
		type: mongoose.ObjectId,
		required: [true, "A viagem referenciada por essa passagem deve ser informada."]
	},
	userId: {
		type: mongoose.ObjectId,
		required: [true, "O usuário autor dessa passagem deve ser informado."]
	},
	scheduled: {
		type: Boolean,
		required: [true, "O estado de cancelamento ou agendamento deve ser informado."]
	},
	numSeatsReserved: {
		type: Number,
		required: [true, 'O número de assentos reservados deve ser informado.']
	}
});

module.exports = mongoose.model("Passages", passageSchema);
