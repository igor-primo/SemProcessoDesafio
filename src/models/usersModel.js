const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "E-mail deve ser informado."],
		trim: true,
		maxlength: [40, "E-mail não pode conter mais do que 40 caracteres."],
		unique: true
	},
	username: {
		type: String,
		required: [true, "Nome de usuário deve ser informado."],
		trim: true,
		maxlength: [20, "Nome de usuário não pode conter mais do que 20 caracteres."],
		unique: true
	},
	password: {
		type: String,
		required: [true, "Senha deve ser informada."],
		maxlength: [100],
	},
	isManager: {
		type: Boolean,
		required: [true, "Se o usuário é gestor deve ser informado."],
		unique: true
	},
});

usersSchema.plugin(require('mongoose-unique-validator'), {message: 'Erro, {PATH} deve ser único.'});

module.exports = mongoose.model("Users", usersSchema);
