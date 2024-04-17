const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

module.exports = {
  createOrder: async (req, res) => {
    try {
      const { userId, items, address, phone, type } = req.body;

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
      const itemIds = items.map((item) => item._id);
      // Xóa các sản phẩm đã đặt khỏi giỏ hàng của người dùng

      if (type == "Cart") {
        const cart = await Cart.findOne({ user: userId });
        // Loại bỏ các sản phẩm đã đặt khỏi danh sách sản phẩm trong giỏ hàng
        const updatedItems = cart.items.filter((item) => {
          const itemIdString = item._id.toString(); // Chuyển đổi _id của item thành chuỗi
          return !itemIds.some(
            (id) => id === itemIdString || id.toString() === itemIdString
          );
        });

        const updatedTotalQuantity = cart.totalQuantity - itemIds.length;

        // Cập nhật lại giỏ hàng với danh sách sản phẩm mới và totalQuantity
        await Cart.findOneAndUpdate(
          { user: userId },
          {
            $set: { items: updatedItems, totalQuantity: updatedTotalQuantity },
          },
          { new: true }
        );
      }

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
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
};
