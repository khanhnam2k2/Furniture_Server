const router = require("express").Router();
const ProductController = require("../controllers/ProductController");

router.get("/", ProductController.getProductList);
router.get("/search", ProductController.searchProduct);
router.get("/:categoryId", ProductController.getProductByCategory);
router.post("/", ProductController.createProduct);

module.exports = router;
