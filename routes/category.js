const CategoryController = require("../controllers/CategoryController");

const router = require("express").Router();

router.get("/", CategoryController.getCategoryList);
router.post("/", CategoryController.createCategory);

module.exports = router;
