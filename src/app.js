const express = require("express");
const server = express();

const users = require("./routers/usersRouter.js");
const management = require("./routers/managementRouter.js");
const passage = require("./routers/passageRouter.js");
const {errorHandler} = require("./wrappers/errorWpr.js");

server.use(express.json());
server.use(users);
server.use(management);
server.use(passage);
server.use(errorHandler);

module.exports = server;
