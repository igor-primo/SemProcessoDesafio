const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "E-mail deve ser informado."],
		trim: true,
		maxlength: [20, "E-mail não pode conter mais do que 20 caracteres."],
	},
	username: {
		type: String,
		required: [true, "Nome de usuário deve ser informado."],
		trim: true,
		maxlength: [10, "Nome de usuário não pode conter mais do que 10 caracteres."],
	},
	password: {
		type: String,
		required: [true, "Senha deve ser informada."],
		maxlength: [100],
	},
	isManager: {
		type: Boolean,
		required: [true, "Se o usuário é gestor deve ser informado."],
	},
});

module.exports = mongoose.model("Users", usersSchema);
