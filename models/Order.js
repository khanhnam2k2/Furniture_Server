const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 1, required: true },
  price: { type: Number, required: true },
});
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [OrderItemSchema], // Tham chiếu tới schema của các mục đơn hàng
  address: { type: String, required: true }, // Thêm trường address
  phone: { type: String, required: true }, // Thêm trường phone
  totalPrice: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
