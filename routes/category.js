const router = require("express").Router();
const CategoryController = require("../controllers/CategoryController");
const checkRoleAdmin = require("../middleware/authMiddleware");

router.get("/", CategoryController.getCategoryList);
router.post("/", checkRoleAdmin(), CategoryController.createCategory);
router.delete("/:id", checkRoleAdmin(), CategoryController.deleteCategory);

module.exports = router;
