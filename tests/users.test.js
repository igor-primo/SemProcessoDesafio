const request = require("supertest");
const app = require("../src/app.js");
const {dbconnect, dbdisconnect, dbdropall} = require("../src/db/connect.js");
 
beforeAll(async () => { 
	await dbconnect(); 
});

afterAll(async () => {
	await dbdropall('users');
	await dbdropall('travelmanagements');
	await dbdisconnect();
});

const signupBody = {
	username: 'Igor Primo',
	email: 'igor@email.com',
	password: '123mudar456',
	isManager: false
};

describe("user authentication", () => {

	test("signup user", async () => {

		const body = {...signupBody};

		const response = await request(app).
			post("/auth/signup").
			  send(body);

		delete body.password;

		expect(response._body).toEqual(
			expect.objectContaining(body)
		);
	});

	test("log in user", async () => {

		const {username, isManager, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signin").
			  send(body);

		expect(response._body).toHaveProperty('email'); 
	});

});

describe("user authentication failure cases", () => {
	// failure cases

	test("signup username ommitted", async () => {
		const {username, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signup").
			  send(body);

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signup email ommitted", async () => {
		const {email, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signup").
			  send(body);

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signup password ommitted", async () => {
		const {password, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signup").
			  send(body);

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signup isManager ommitted", async () => {
		const {isManager, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signup").
			  send(body);

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signin email omitted", async () => {
		const {username, isManager, email, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signup").
			  send(body);

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signin password omitted", async () => {
		const {username, isManager, password, ...body} = signupBody;

		const response = await request(app).
			  post("/auth/signup").
			  send(body);

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});
	
});

const travelInfo = {
	destiny: "Mars",
	date: new Date("2023-10-10").toISOString(),
	departureTime: new Date().toISOString(),
	arrivalTime: new Date().toISOString(),
	price: "$M300,00",
	seatsAvailable: 25,
	scheduled: true
};

let authTokenForManager;
let authTokenForNonManager;

describe("travel management", () => {

	test("get auth token for manager", async () => {

		const userData = {
			username: 'Igor Primo',
			email: 'igor-manager@email.com',
			password: '123mudar456',
			isManager: true
		}
	
		// signup
		const resultSignup = await request(app).
			post("/auth/signup").
			send(userData);

		const { username, isManager, ...signinData } = userData;

		// login
		const loginResponse = await request(app).
			post("/auth/signin").
			  send(signinData);

		authTokenForManager = loginResponse._body.authToken;

		return;
	});

	test("get auth token for non manager", async () => {
			
		const userData = {
			username: 'Igor Primo',
			email: 'igor-non-manager@email.com',
			password: '123mudar456',
			isManager: false
		}
	
		// signup
		const resultSignup = await request(app).
			post("/auth/signup").
			send(userData);

		const { username, isManager, ...signinData } = userData;

		// login
		const loginResponse = await request(app).
			post("/auth/signin").
			  send(signinData);

		authTokenForNonManager = loginResponse._body.authToken;

		return;
	});

	test("register travel by manager", async () => {

		const travel = {...travelInfo};  

		const response = await request(app).
			  post("/travel").
			  set("Authorization", "Bearer "+authTokenForManager).
			  send(travel);

		expect(response._body).toEqual(
			expect.objectContaining(travel)
		);
	})
	
	test("get travels for manager", async () => {

		const response = await request(app).
			  get("/travel").
			  set("Authorization", "Bearer "+authTokenForManager);

		expect(response._body).toEqual(
			expect.arrayContaining(
				[expect.objectContaining(travelInfo)]
			)
		);

	});

	test("get travels for non manager", async () => {

		const response = await request(app).
			  get("/travel").
			  set("Authorization", "Bearer "+authTokenForNonManager);

		expect(response._body).toEqual(
			expect.arrayContaining(
				[expect.objectContaining(travelInfo)]
			)
		);

	});

	test("travel cancellation by manager", async () => {
		const travel = {...travelInfo};

		const resultTravel = await request(app).
			  post("/travel").
			  send(travel).
			  set("Authorization", "Bearer "+authTokenForManager);

		const {_id, scheduled} = resultTravel._body;

		const response = await request(app).
			  put("/travel/change_scheduled_status").
			  send({_id, scheduled}).
			  set("Authorization", "Bearer "+authTokenForManager);

		expect(response._body).toEqual(
			expect.objectContaining({
				scheduled: expect.anything()
			})
		);
		
	});

	// TODO: how to do more complex puts properly with mongo?

	test("travel rescheduling by manager", async () => {
		const travel = {...travelInfo};
		const travelModified = {...travel};

		const resultTravel = await request(app).
			  post("/travel").
			  send(travel).
			  set("Authorization", "Bearer "+authTokenForManager);

		const {_id} = resultTravel._body;

		travelModified.date = new Date().toISOString();
		const resultFirstPut = await request(app).
			  put("/travel/"+_id+"/reschedule").
			  send(travelModified).
			  set("Authorization", "Bearer "+authTokenForManager);

		expect(resultFirstPut._body).toEqual(
			expect.objectContaining({
				date: expect.anything()
			})
		);

		travelModified.departureTime = new Date().toISOString();
		const resultSecondPut = await request(app).
			  put("/travel/"+_id+"/reschedule").
			  send(travelModified).
			  set("Authorization", "Bearer "+authTokenForManager);
		
		expect(resultSecondPut._body).toEqual(
			expect.objectContaining({
				date: expect.anything()
			})
		);		
		
		travelModified.arrivalTime = new Date().toISOString();
		const resultThirdPut = await request(app).
			  put("/travel/"+_id+"/reschedule").
			  send(travelModified).
			  set("Authorization", "Bearer "+authTokenForManager);
		
		expect(resultThirdPut._body).toEqual(
			expect.objectContaining({
				date: expect.anything()
			})
		);

	});

});

describe("travel management failure cases", () => {

	//failure cases

	test("travel registration by non manager", async () => {

		const travel = {...travelInfo};

		const response = await request(app).
			  post("/travel").
			  set("Authorization", "Bearer "+authTokenForNonManager).
			  send(travel);

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});

	test("travel cancellation by non manager", async () => {
		const travel = {...travelInfo};

		const resultTravel = await request(app).
			  post("/travel").
			  send(travel).
			  set("Authorization", "Bearer "+authTokenForNonManager);

		const {_id, scheduled} = resultTravel._body;

		const response = await request(app).
			  put("/travel/change_scheduled_status").
			  send({_id, scheduled}).
			  set("Authorization", "Bearer "+authTokenForNonManager);

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});

	test("travel rescheduling by non manager", async () => {
		const travel = {...travelInfo};
		const travelModified = {...travel};

		const resultTravel = await request(app).
			  post("/travel").
			  send(travel).
			  set("Authorization", "Bearer "+authTokenForManager);

		const {_id} = resultTravel._body;

		travelModified.date = new Date().toISOString();
		const response = await request(app).
			  put("/travel/"+_id+"/reschedule").
			  send(travelModified).
			  set("Authorization", "Bearer "+authTokenForNonManager);

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});
});

// TODO: put id in travel to reference the manager that registered it

describe("reserving", () => {
	test("reserving 2 seats maximum", async () => {
		const travels = await request(app).
			  get("/travel").
			  set("Authorization", "Bearer "+authTokenForNonManager);

		console.log(travels._body);
		
	});
});
