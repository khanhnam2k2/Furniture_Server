const router = require("express").Router();
const ProductController = require("../controllers/ProductController");

router.get("/", ProductController.getProductList);
router.get("/best-sellers", ProductController.getProductSellers);
router.post("/", ProductController.createProduct);

module.exports = router;
