const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAlowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAlowed);
router.route("/").get(controller.list).post(controller.create).all(methodNotAlowed);

module.exports = router;
