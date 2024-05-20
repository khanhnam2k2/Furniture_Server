const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

module.exports = {
  // Hàm đặt hàng cho người dùng
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
  // Hàm lấy thông tin đơn hàng của người dùng theo status
  getOrderUserListByStatus: async (req, res) => {
    try {
      const { status } = req.query;
      const userId = req.params.userId;
      const orders = await Order.find({ user: userId, status: status })
        .populate("items.product")
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  // Hàm lấy thông đơn hàng cho người dùng
  getTotalOrderByStatus: async (req, res) => {
    try {
      const userId = req.params.userId;
      // Đếm số lượng đơn hàng theo trạng thái cho userId cụ thể
      const totalPending = await Order.countDocuments({
        user: userId,
        status: 0,
      });
      const totalDelivering = await Order.countDocuments({
        user: userId,
        status: 1,
      });
      const totalComplete = await Order.countDocuments({
        user: userId,
        status: 2,
      });
      res.status(200).json({
        pending: totalPending,
        delivering: totalDelivering,
        complete: totalComplete,
      });
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  // Lấy tất cả đơn hàng
  getAllOrders: async (req, res) => {
    try {
      let query = {};
      if (!req.query.page) {
        const orders = await Order.find()
          .populate("items.product")
          .populate("user")
          .sort({ createdAt: -1 })
          .exec();
        return res.status(200).json(orders);
      }
      // Tìm tất cả các đơn hàng

      const page = req.query.page || 1;
      const limit = req.query.limit || 3;
      const startIndex = (page - 1) * limit;

      const orders = await Order.find(query)
        .populate("items.product")
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / limit);

      res.status(200).json({ orders, totalPages });
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi khi lấy danh sách đơn hàng");
    }
  },
  // Hàm cập nhật trạng thái đơn hàng
  updateStatus: async (req, res) => {
    try {
      const { orderId } = req.params; // Lấy id của đơn hàng từ params
      const { status } = req.body; // Lấy trạng thái mới từ body của yêu cầu

      // Tìm đơn hàng trong cơ sở dữ liệu và cập nhật trạng thái
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: status },
        { new: true } // Trả về đối tượng đơn hàng đã được cập nhật
      );

      if (!updatedOrder) {
        // Nếu không tìm thấy đơn hàng, trả về lỗi 404 - Not Found
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }

      // Trả về đơn hàng đã được cập nhật
      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
      // Nếu có lỗi xảy ra trong quá trình xử lý, trả về lỗi 500 - Internal Server Error
      res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng" });
    }
  },
};
