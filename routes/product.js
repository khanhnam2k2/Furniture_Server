const router = require("express").Router();
const multer = require("multer");
const ProductController = require("../controllers/ProductController");
const checkRoleAdmin = require("../middleware/authMiddleware");
// Cấu hình multer để lưu trữ hình ảnh trong thư mục 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.get("/", ProductController.getProductList);
router.get("/search", ProductController.searchProduct);
router.get("/:categoryId", ProductController.getProductByCategory);
router.post(
  "/",
  checkRoleAdmin(),
  upload.array("images", 10),
  ProductController.createProduct
);

module.exports = router;
