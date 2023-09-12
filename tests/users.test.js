const request = require("supertest");
const app = require("../src/app.js");
const {dbconnect, dbdisconnect} = require("../src/db/connect.js");

describe("user authentication", () => {

	beforeAll(async () => {
		await dbconnect();
	});

	afterAll(async () => {
		await dbdisconnect();
	});

	const signupBody = {
		username: 'Igor Primo',
		email: 'igor@email.com',
		password: '123mudar456',
		isManager: false
	};

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

