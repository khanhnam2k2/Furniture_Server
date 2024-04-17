const router = require("express").Router();
const OrderController = require("../controllers/OrderController");

router.get("/", OrderController.getOrderListByStatus);
router.post("/", OrderController.createOrder);

module.exports = router;
