const swaggerAutogen = require('swagger-autogen')();

const doc = {
	info: {
		title: 'SpaceTravel API',
		description: 'API',
	},
	host: process.env.APP_URL,
	schemes: ['http'],
	definitions: {
		user: {
			username: 'Igor Primo',
			email: 'igor@email.com',
			isManager: true,
			password: '123hihihi456'
		},
		validationErrorMsg: {
			message: 'Mensagem de erro.'
		},
		internalErrorMsg: {
			message: 'Erro interno de sistema.'
		},
		userCreated: {
			_id: 'SomeHash',
			__v: 'SomeVersionKey',
			username: 'Igor Primo',
			email: 'igor@email.com',
			isManager: true,
			password: '123hihihi456'
		},
		loginData: {
			email: 'igor@email.com',
			password: '123hihihi456'
		},
		userLogged: {
			_id: 'SomeHash',
			__v: 'SomeVersionKey',
			email: 'igor@email.com',
			username: 'Igor Primo',
			isManager: true,
			authToken: 'SomeJWT'
		},
		travelList: [
			{
				destiny: "Mars",
				date: new Date("2023-10-10").toISOString(),
				departureTime: new Date().toISOString(),
				arrivalTime: new Date().toISOString(),
				price: "$Σ300,00",
				seatsAvailable: 25,
				scheduled: true
			}
		],
		travel: {
			destiny: "Mars",
			date: new Date("2023-10-10").toISOString(),
			departureTime: new Date().toISOString(),
			arrivalTime: new Date().toISOString(),
			price: "$Σ300,00",
			seatsAvailable: 25,
			scheduled: true
		},
		travelPosted: {
			_id: 'SomeHash',
			__v: 'SomeVersionKey',
			destiny: "Mars",
			date: new Date("2023-10-10").toISOString(),
			departureTime: new Date().toISOString(),
			arrivalTime: new Date().toISOString(),
			price: "$Σ300,00",
			seatsAvailable: 25,
			scheduled: true
		},
		dataToChangeScheduled: {
			_id: 'SomeHash',
			scheduled: false,
		},
		rescheduleData: {
			date: new Date().toISOString(),
			arrivalTime: new Date().toISOString(),
			departureTime: new Date().toISOString()
		},
		passageToBeReturned: {
			passage: {
				_id: 'SomeHash',
				__v: 'SomeVersionKey',
				travelId: 'SomeHash',
				userId: 'SomeHash',
				scheduled: true
			},
			travel: {
				_id: 'SomeHash',
				__v: 'SomeVersionKey',
				destiny: "Mars",
				date: new Date("2023-10-10").toISOString(),
				departureTime: new Date().toISOString(),
				arrivalTime: new Date().toISOString(),
				price: "$Σ300,00",
				seatsAvailable: 25,
				scheduled: true
			}
		},
		userPassagesArray: [
			{
				passage: {
					_id: 'SomeHash',
					__v: 'SomeVersionKey',
					travelId: 'SomeHash',
					userId: 'SomeHash',
					scheduled: true
				},
				travel: {
					_id: 'SomeHash',
					__v: 'SomeVersionKey',
					destiny: "Mars",
					date: new Date("2023-10-10").toISOString(),
					departureTime: new Date().toISOString(),
					arrivalTime: new Date().toISOString(),
					price: "$Σ300,00",
					seatsAvailable: 25,
					scheduled: true
				}
			}
		],
		reserveOutputData: {
			passage: {
				_id: 'SomeHash',
				__v: 'SomeVersionKey',
				travelId: 'SomeHash',
				userId: 'SomeHash',
				scheduled: true
			},
			confirmationCard: {
				transactionDate: new Date().toISOString(),
				merchantName: 'Space Travel LTDA.',
				merchantContactNumber: '9999-9999',
				paymentDetails: {
					amount: '$∑300',
					currency: 'Estalecas ($∑)',
					decription: 'Mensagem de descrição do pagamento.',
					paymentMethod: 'debit',
					billing: null
				},
				message: 'Mensagem referente ao pagamento.',
				passageId: 'SomeHash',
			}
		},
		reservationInput: {
			numSeatsToReserve: 2,
			cardNumber: '888888',
			expirationDate: new Date().toISOString(),
			cvv: '288',
			paymentMethod: 'debit'
		},
		passageToBeChanged: {
			_id: 'SomeHash'
		},
		reserveOutputDataForCancellation: {
			passage: {
				_id: 'SomeHash',
				__v: 'SomeVersionKey',
				travelId: 'SomeHash',
				userId: 'SomeHash',
				scheduled: true
			},
			refundCard: {
				transactionDate: new Date().toISOString(),
				merchantName: 'Space Travel LTDA.',
				merchantContactNumber: '9999-9999',
				paymentDetails: {
					amount: '$∑300',
					currency: 'Estalecas ($∑)',
					decription: 'Mensagem de descrição do pagamento.',
					paymentMethod: 'debit',
					billing: null
				},
				message: 'Mensagem referente ao pagamento.',
				passageId: 'SomeHash',
				refunded: false
			}
		},

	}
};

const outputFile = '../doc/swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
