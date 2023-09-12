const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_CRED;

const dbconnect = _ => {
	const options = {
		useNewUrlParser: true, 
		// useCreateIndex: true, 
		// useFindAndModify: false,
		useUnifiedTopology: true,
	};
	return mongoose.connect(connectionString, options);
}

const dbdisconnect = _ => mongoose.disconnect();

module.exports = {dbconnect, dbdisconnect};
