const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_CRED;

const dbconnect = (dbName) => {
	const options = {
		dbName: dbName,
		useNewUrlParser: true, 
		// useCreateIndex: true, 
		// useFindAndModify: false,
		useUnifiedTopology: true,
	};
	return mongoose.connect(connectionString, options);
}

const dbdisconnect = _ => mongoose.disconnect();
const dbdropall = async collection => {
	await mongoose.
		connection.
		collections[collection].
		drop();
};

module.exports = {dbconnect, dbdisconnect, dbdropall};
