const server = require("./app.js");
const {dbconnect, dbdisconnect} = require("./db/connect.js");

const PORT = process.env.PORT || 8082;

(async _ => {
	try {
		console.log("connecting to db");
		await dbconnect('SpaceTravel');
		console.log("connected to db");
		server.listen(PORT, _ => console.log("Listening on " + PORT + "."));
	} catch(err) {
		console.log(err);
		await dbdisconnect();
	}
})();


