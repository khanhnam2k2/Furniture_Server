const router = require("express").Router();
const OrderController = require("../controllers/OrderController");

router.get("/", OrderController.getAllOrders);
router.get("/:userId", OrderController.getOrderUserListByStatus);
router.post("/", OrderController.createOrder);

module.exports = router;
