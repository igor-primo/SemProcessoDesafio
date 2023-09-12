const router = require("express").Router();
const { signup, signin } = require("../controllers/usersContrl.js");

router.route("/auth/signup").
	post(signup);

router.route("/auth/signin").
	post(signin);

module.exports = router;
