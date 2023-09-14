const router = require("express").Router();
const {getTravels,
	   postTravel,
	   changeScheduledStatus,
	   reschedule
} = require("../controllers/managementContrl");
const {authenticate, authenticateManager} = require("../controllers/usersContrl");

router.route("/travel").
	all(authenticate).
	get(getTravels).
	all(authenticateManager).
	post(postTravel);

router.route("/travel/change_scheduled_status").
	all(authenticate).
	all(authenticateManager).
	put(changeScheduledStatus);

router.route("/travel/:_id/reschedule").
	all(authenticate).
	all(authenticateManager).
	put(reschedule);

module.exports = router;
