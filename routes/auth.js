const router = require("express").Router();
const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.createUser);
router.post("/login", AuthController.login);

module.exports = router;
