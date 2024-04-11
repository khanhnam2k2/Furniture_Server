const router = require("express").Router();
const CategoryController = require("../controllers/CategoryController");

router.get("/", CategoryController.getCategoryList);
router.post("/", CategoryController.createCategory);

module.exports = router;
