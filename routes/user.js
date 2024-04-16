const router = require("express").Router();
const UserController = require("../controllers/UserController");

router.put("/:id/updateProfile", UserController.updateUserProfile);

module.exports = router;
