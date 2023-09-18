const router = require("express").Router();
const {getTravels,
	   postTravel,
	   changeScheduledStatus,
	   reschedule,
	   reserve
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

router.route("/travel/:_id/reserve").
	all(authenticate).
	put(reserve);

module.exports = router;
