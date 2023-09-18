const { getPassagesFromUser,
		getPassage,
		reserve,
		changePassage,
		cancelPassage
} = require("../controllers/passageContrl");
const { authenticate } = require("../controllers/usersContrl");

const router = require("express").Router();

router.use(authenticate);

// the following middleware will retrieve user id
// from JWT
router.route("/passage/user/get").
	get(getPassagesFromUser);

router.route("/passage/:_id/get").
	get(getPassage);

router.route("/passage/:_id/reserve").
	put(reserve);

router.route("/passage/:_id/change").
	put(changePassage);

router.route("/passage/:id/cancel").
	put(cancelPassage);

module.exports = router;
