const router = require("express").Router();
const CategoryController = require("../controllers/CategoryController");
const { checkRoleAdmin } = require("../middleware/authMiddleware");

router.get("/", CategoryController.getCategoryList);
router.get("/:id", CategoryController.getCategoryById);
router.post("/", checkRoleAdmin(), CategoryController.createCategory);
router.put("/:id", checkRoleAdmin(), CategoryController.editCategory);
router.delete("/:id", checkRoleAdmin(), CategoryController.deleteCategory);

module.exports = router;
