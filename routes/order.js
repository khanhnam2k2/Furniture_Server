const router = require("express").Router();
const OrderController = require("../controllers/OrderController");

router.get("/", OrderController.getAllOrders);
router.get("/:userId", OrderController.getOrderUserListByStatus);
router.post("/", OrderController.createOrder);
router.put("/updateStatus/:orderId", OrderController.updateStatus);

module.exports = router;
