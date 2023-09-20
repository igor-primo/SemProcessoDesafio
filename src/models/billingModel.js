const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
	amount: {
		type: String,
		required: true,
	},
	currency: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	paymentMethod: {
		type: String,
		required: true
	},
	billing: {
		type: String
	}
});

const billingSchema = new mongoose.Schema({
	transactionDate: {
		type: Date,
		required: true,
	},
	merchantName: {
		type: String,
		required: true
	},
	merchantContactNumber: {
		type: String,
		required: true
	},
	paymentDetails: paymentDetailsSchema,
	// paymentDetails: {
	// 	type: mongoose.ObjectId,
	// 	ref: 'paymentDetailsSchema',
	// 	required: true
	// },
	message: {
		type: String,
		required: true
	},
	passageId: {
		type: mongoose.ObjectId,
		required: true
	}
});

module.exports = mongoose.model("BillingManagement", billingSchema);
