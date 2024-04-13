const router = require("express").Router();
const CartController = require("../controllers/CartController");

router.get("/:userId", CartController.getCartItems);
router.post("/addToCart", CartController.addToCart);
router.put("/update", CartController.updateCartItemQuantity);
router.delete("/delete/:userId/:itemId", CartController.deleteCartItem);

module.exports = router;
