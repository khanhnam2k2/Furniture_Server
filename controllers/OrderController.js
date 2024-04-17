const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

module.exports = {
  createOrder: async (req, res) => {
    try {
      const { userId, items, address, phone } = req.body;

      // Tính tổng giá của đơn hàng dựa trên các mục hàng
      const totalPrice = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Tạo đơn hàng mới
      const newOrder = new Order({
        user: userId,
        items: items,
        address: address,
        phone: phone,
        totalPrice: totalPrice,
      });

      // Lưu đơn hàng vào cơ sở dữ liệu
      await newOrder.save();

      // Xóa các sản phẩm đã đặt khỏi giỏ hàng của người dùng
      const itemIds = items.map((item) => item._id);
      await Cart.updateOne(
        { user: userId },
        { $pull: { items: { _id: { $in: itemIds } } } }
      );

      // Cập nhật lại số lượng sản phẩm trong bảng sản phẩm
      await Promise.all(
        items.map(async (item) => {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { quantity: -item.quantity } }
          );
        })
      );

      res.status(201).json({ success: true, message: "Đặt hàng thành công" });
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  getOrderListByStatus: async (req, res) => {
    try {
      const { status } = req.query;
      const orders = await Order.find({ status: status })
        .populate("items.product")
        .exec();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
};
