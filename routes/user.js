const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { checkAuth } = require("../middleware/authMiddleware");

router.get("/getUser", checkAuth(), UserController.getCurrentUser);
router.put("/:id/updateProfile", UserController.updateUserProfile);

module.exports = router;
