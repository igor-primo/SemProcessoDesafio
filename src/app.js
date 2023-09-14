const server = require("express")();

const {dbconnect, dbdisconnect} = require("./db/connect.js");
const users = require("./routers/usersRouter.js");
const management = require("./routers/managementRouter.js");
const {errorHandler} = require("./wrappers/errorWpr.js");

const baseUrl = "/api/v1";

server.use(require("express").json());
server.use(users);
server.use(management);
server.use(errorHandler);

module.exports = server;
