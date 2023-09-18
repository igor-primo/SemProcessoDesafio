const request = require("supertest");
const app = require("../src/app.js");
const {dbconnect, dbdisconnect, dbdropall} = require("../src/db/connect.js");
 
beforeEach(async () => { 
	await dbconnect(); 
});

afterEach(async () => {
	await dbdropall('users');
	await dbdropall('travelmanagements');
	await dbdropall('passages');
	await dbdisconnect();
});

// helper data and helper functions

const signupBody = {
	username: 'Igor Primo',
	email: 'igor@email.com',
	password: '123mudar456',
	isManager: false
};

const signin = async (params) => {
	const {email, password} = params;
	return request(app).
		post("/auth/signin").
		  send({email, password});
};

const signup = async (params) => {
	const {username, email, password, isManager} = params;
	return request(app).
		post("/auth/signup").
		send({username, email, password, isManager});
};
// TODO: put id in travel to reference the manager that registered it

const reserveTravel = async (params) => {
	const {authToken, _id, numSeatsToReserve} = params;

	return request(app).
		put("/passage/"+_id+"/reserve").
		send({numSeatsToReserve}).
		set("Authorization", "Bearer "+authToken);
}

const getPassages = async (params) => {
	const {authToken} = params;

	return request(app).
		get("/passage/user/get").
		set("Authorization", "Bearer "+authToken);
}

const getSpecificPassage = async (params) => {
	const {authToken, _id} = params;

	return request(app).
		get("/passage/"+_id+"/get").
		set("Authorization", "Bearer "+authToken);
}

const travelInfo = {
	destiny: "Mars",
	date: new Date("2023-10-10").toISOString(),
	departureTime: new Date().toISOString(),
	arrivalTime: new Date().toISOString(),
	price: "$Σ300,00",
	seatsAvailable: 25,
	scheduled: true
};

const userManager = {
	username: 'Igor Manager',
	email: 'igor-manager@email.com',
	password: '123manager456',
	isManager: true
};

const userNonManager = {
	username: 'Igor Non Manager',
	email: 'igor-non-manager@email.com',
	password: '123nonmanager456',
	isManager: false
};

const postTravel = async (params) => {
	const {authToken, travel} = params;

	return request(app).
		post("/travel").
		set("Authorization", "Bearer " + authToken).
		  send(travel);
};

const getTravels = async (params) => {
	const {authToken} = params;

	return request(app).
		get("/travel").
		  set("Authorization", "Bearer " + authToken);
};

const changeScheduledStatus = async (params) => {
	const {authToken, travel} = params;
	const {_id, scheduled} = travel;

	return request(app).
		put("/travel/change_scheduled_status").
		send({ _id, scheduled }).
		  set("Authorization", "Bearer " + authToken);
}

const rescheduleTravel = async (params) => {
	const {authToken, travelParams} = params;
	const {_id, date, departureTime, arrivalTime} = travelParams;

	return request(app).
		put("/travel/" + _id + "/reschedule").
		send({date, departureTime, arrivalTime}).
		  set("Authorization", "Bearer " + authToken);

}

const modifyTravel = async (field, userType) => {

	const user = userType == 'manager' ? userManager : userNonManager;

	await signup(user);
	const { _body } = await signin(user);
	const {authToken} = _body;

	const response = await postTravel({ authToken, travel: { ...travelInfo } });

	const travelModified = { ...response._body };

	travelModified[field] = new Date().toISOString();
	return rescheduleTravel({authToken, travelParams: { ...travelModified }});
};

// real tests

describe("user authentication", () => {

	test("signup user", async () => {
		const {password, ...body} = signupBody;

		const response = await signup({...signupBody});

		expect(response._body).toEqual(
			expect.objectContaining(body)
		);
	});

	test("log in user", async () => {
		await signup({...signupBody});
		const {username, isManager, ...body} = signupBody;

		const response = await signin(body);

		expect(response._body).toHaveProperty('email'); 
	});

});

describe("user authentication failure cases", () => {
	// failure cases

	test("signup username ommitted", async () => {
		const {username, ...body} = signupBody;

		const response = await signup(body)

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signup email ommitted", async () => {
		const {email, ...body} = signupBody;

		const response = await signup(body)

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signup password ommitted", async () => {
		const {password, ...body} = signupBody;

		const response = await signup(body)

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signup isManager ommitted", async () => {
		const {isManager, ...body} = signupBody;

		const response = await signup(body)

		expect(response.statusCode).toBe(400);
		expect(response._body).toHaveProperty('message');
	});

	test("signin email omitted", async () => {
		const {username, isManager, email, ...body} = signupBody;

		await signup(signupBody);
		const response = await signin(body)

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});

	test("signin password omitted", async () => {
		const {username, isManager, password, ...body} = signupBody;

		await signup(signupBody);
		const response = await signin(body)

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});

	test("authenticate without authToken", async () => {
		const {username, isManager, ...body} = signupBody;

		await signup(signupBody);
		await signin(body);

		const response = await request(app).
			get("/travel").
			  set("Authorization", "Bearer ");

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});
	
});


describe("travel management", () => {

	test("travel registration by manager", async () => {

		await signup(userManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;

		const response = await postTravel({authToken, travel: {...travelInfo}});
		
		expect(response._body).toEqual(
			expect.objectContaining(travelInfo)
		);
	})
	
	test("get travels for manager", async () => {

		await signup(userManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;

		await postTravel({authToken, travel: {...travelInfo}});

		const response = await getTravels({authToken});
		
		expect(response._body).toEqual(
			expect.arrayContaining(
				[expect.objectContaining(travelInfo)]
			)
		);

	});

	test("get travels for non manager", async () => {

		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;
		const nonManager = await signin(userNonManager);
		const authTokenNonManager = nonManager._body.authToken;

		await postTravel({authToken, travel: {...travelInfo}});

		const response = await getTravels({authToken: authTokenNonManager});

		expect(response._body).toEqual(
			expect.arrayContaining(
				[expect.objectContaining(travelInfo)]
			)
		);

	});

	test("travel cancellation by manager", async () => {

		await signup(userManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;

		const response = await postTravel({authToken, travel: {...travelInfo}});

		const responsePut = await changeScheduledStatus({authToken, travel: {...response._body}});

		expect(responsePut._body).toEqual(
			expect.objectContaining({
				scheduled: expect.anything()
			})
		);
		
	});

	// TODO: how to do more complex puts properly with mongo?

	test("travel rescheduling date by manager", async () => {
		const resultRescheduled = await modifyTravel('date', 'manager');
		expect(resultRescheduled._body).toEqual(
			expect.objectContaining({
				date: expect.anything()
			})
		);
	});

	test("travel rescheduling departureTime by manager", async () => {
		const resultRescheduled = await modifyTravel('departureTime', 'manager');
		expect(resultRescheduled._body).toEqual(
			expect.objectContaining({
				departureTime: expect.anything()
			})
		);
	});

	test("travel rescheduling arrivalTime by manager", async () => {
		const resultRescheduled = await modifyTravel('arrivalTime', 'manager');
		expect(resultRescheduled._body).toEqual(
			expect.objectContaining({
				arrivalTime: expect.anything()
			})
		);
	});

});

describe("travel management failure cases", () => {

	//failure cases

	test("travel registration by non manager", async () => {

		await signup(userNonManager);
		const {_body} = await signin(userNonManager);
		const {authToken} = _body;

		const response = await postTravel({authToken, travel: {...travelInfo}});

		expect(response.statusCode).toBe(404);
		expect(response._body).toHaveProperty('message');
	});

	test("travel cancellation by non manager", async () => {
		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userNonManager);
		const {authToken} = _body;

		const response = await postTravel({authToken, travel: {...travelInfo}});

		const responsePut = await changeScheduledStatus({authToken, travel: {...response._body}});

		expect(responsePut.statusCode).toBe(404);
		expect(responsePut._body).toHaveProperty('message');
	});

	test("travel rescheduling date by non manager", async () => {
		const resultRescheduled = await modifyTravel('date', 'nonmanager');
		expect(resultRescheduled.statusCode).toBe(404);
		expect(resultRescheduled._body).toHaveProperty('message');
	});

	test("travel rescheduling departureTime by non manager", async () => {
		const resultRescheduled = await modifyTravel('departureTime', 'nonmanager');
		expect(resultRescheduled.statusCode).toBe(404);
		expect(resultRescheduled._body).toHaveProperty('message');
	});

	test("travel rescheduling arrivalTime by non manager", async () => {
		const resultRescheduled = await modifyTravel('arrivalTime', 'nonmanager');
		expect(resultRescheduled.statusCode).toBe(404);
		expect(resultRescheduled._body).toHaveProperty('message');
	});

});


describe("passage management", () => {
	test("get passages from a user", async () => {
		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;
		const nonManager = await signin(userNonManager);
		const authTokenNonManager = nonManager._body.authToken;

		for(let i=0;i<10;i++) {
			const travel = { ...travelInfo };
			travel.seatsAvailable = 2;

			const travelPosted = await postTravel({ authToken, travel });
			const { _id } = travelPosted._body;

			await reserveTravel({authToken: authTokenNonManager, _id, numSeatsToReserve: 2});
		}

		const passages = await getPassages({authToken: authTokenNonManager});

		expect(passages._body).toEqual(
			expect.arrayContaining(
				[expect.objectContaining({passage: expect.anything(), travel: expect.anything()})]
			)
		);
	});

	test("get passage in detail", async () => {
		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;
		const nonManager = await signin(userNonManager);
		const authTokenNonManager = nonManager._body.authToken;

		const travel = { ...travelInfo };
		travel.seatsAvailable = 2;

		const travelPosted = await postTravel({ authToken, travel });
		const { _id } = travelPosted._body;

		const passageData = await reserveTravel({ authToken: authTokenNonManager, _id, numSeatsToReserve: 2 });
		const passageId = passageData._body._id;
		
		const passage = await getSpecificPassage({authToken: authTokenNonManager, _id: passageId});

		expect(passage._body).toEqual(
				expect.objectContaining({passage: expect.anything(), travel: expect.anything()})
		);

	});

	test("reserving up until 2 seats", async () => {
		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;
		const nonManager = await signin(userNonManager);
		const authTokenNonManager = nonManager._body.authToken;

		const travel = {...travelInfo};
		travel.seatsAvailable = 2;

		const travelPosted = await postTravel({authToken, travel});
		const {_id} = travelPosted._body;

		const travelToTest = {...travel};
		travelToTest.seatsAvailable -= 2;

		// TODO: improvement: how to represent seats in db?
		const result = await reserveTravel({authToken: authTokenNonManager, _id, numSeatsToReserve: 2});

		expect(result._body).toEqual(
			expect.objectContaining({
				scheduled: expect.anything(),
				travelId: expect.anything(),
				userId: expect.anything(),
			})
		);
	});
});

describe("passage management failure cases", () => {

	test("reserving up until 2 seats when there is less than 2", async () => {
		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;
		const nonManager = await signin(userNonManager);
		const authTokenNonManager = nonManager._body.authToken;

		const travel = {...travelInfo};
		travel.seatsAvailable = 1;

		const travelPosted = await postTravel({authToken, travel});
		const {_id} = travelPosted._body;

		const result = await reserveTravel({authToken: authTokenNonManager, _id, numSeatsToReserve: 2});

		expect(result.statusCode).toBe(403);
		expect(result._body).toHaveProperty('message');
	});

	test("reserving more than 2 seats", async () => {
		await signup(userManager);
		await signup(userNonManager);
		const {_body} = await signin(userManager);
		const {authToken} = _body;
		const nonManager = await signin(userNonManager);
		const authTokenNonManager = nonManager._body.authToken;

		const travel = {...travelInfo};
		travel.seatsAvailable = 4;

		const travelPosted = await postTravel({authToken, travel});
		const {_id} = travelPosted._body;

		const result = await reserveTravel({authToken: authTokenNonManager, _id, numSeatsToReserve: 3});

		expect(result.statusCode).toBe(403);
		expect(result._body).toHaveProperty('message');
	});
});
