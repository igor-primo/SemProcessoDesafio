const server = require("./app.js");

const PORT = process.env.PORT || 8082;

(async _ => {
	try {
		console.log("connecting to db");
		await dbconnect();
		console.log("connected to db");
		server.listen(PORT, _ => console.log("Listening on " + PORT + "."));
		await dbdisconnect();
	} catch(err) {
		console.log(err);
		await dbdisconnect();
	}
})();


