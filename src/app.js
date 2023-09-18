const server = require("express")();

const users = require("./routers/usersRouter.js");
const management = require("./routers/managementRouter.js");
const passage = require("./routers/passageRouter.js");
const {errorHandler} = require("./wrappers/errorWpr.js");

const baseUrl = "/api/v1";

server.use(require("express").json());
server.use(users);
server.use(management);
server.use(passage);
server.use(errorHandler);

module.exports = server;
