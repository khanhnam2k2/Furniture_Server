const Cart = require("../models/Cart");
const Product = require("../models/Product");

module.exports = {
  // Hàm lấy danh sách sp trong giỏ hàng
  getCartItems: async (req, res) => {
    try {
      const { userId } = req.params;
      // Tìm giỏ hàng của ng dùng
      let cart = await Cart.findOne({ user: userId }).populate("items.product");
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  // Hàm thêm sp vào giỏ hàng
  addToCart: async (req, res) => {
    try {
      const { userId, productId, quantity, price } = req.body;
      // Tìm giỏ hàng của người dùng
      let cart = await Cart.findOne({ user: userId });
      // Nếu không tìm thấy giỏ hàng, thì tạo mới
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      //   Kiểm tra xem sp đã tồn tại trong giỏ hàng hay chưa
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      // Nếu sp đã tồn tại trong giỏ hàng thì cập nhật số lượng
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Nếu chưa tồn tại trong giỏ hàng thì thêm vào giỏ hàng
        cart.items.push({ product: productId, quantity, price });
      }
      cart.totalQuantity = cart?.items?.length;
      await cart.save();
      return res
        .status(200)
        .json({ success: true, message: "Sản phẩm đã được thêm vào giỏ hàng" });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  // Hàm cập nhật sl sp trong giỏ hàng
  updateCartItemQuantity: async (req, res) => {
    try {
      const { userId, itemId, quantity } = req.body;

      // Tìm giỏ hàng của người dùng
      let cart = await Cart.findOne({ user: userId });

      // Kiểm tra xem giỏ hàng có tồn tại không
      if (!cart) {
        return res.json({
          success: false,
          message: "Không tìm thấy giỏ hàng của người dùng",
        });
      }

      // Tìm item trong giỏ hàng
      const itemToUpdate = cart.items.find(
        (item) => item._id.toString() === itemId
      );

      // Kiểm tra xem item có tồn tại không
      if (!itemToUpdate) {
        return res.json({
          success: false,
          message: "Không tìm thấy sản phẩm trong giỏ hàng",
        });
      }

      // Lấy thông tin sản phẩm từ bảng Product
      const product = await Product.findById(itemToUpdate.product);

      // Kiểm tra số lượng sản phẩm trong giỏ hàng với số lượng sản phẩm hiện có trong bảng Product
      if (quantity > product.quantity) {
        return res.json({
          success: false,
          message:
            "Số lượng sản phẩm trong giỏ hàng vượt quá số lượng sản phẩm hiện có",
        });
      }

      // Cập nhật số lượng sản phẩm
      itemToUpdate.quantity = quantity;

      // Cập nhật lại tổng số lượng sản phẩm trong giỏ hàng
      cart.totalQuantity = cart?.items?.length;

      // Lưu lại giỏ hàng sau khi cập nhật
      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Số lượng sản phẩm đã được cập nhật trong giỏ hàng",
      });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  // Hàm xóa sp trong giỏ hàng
  deleteCartItem: async (req, res) => {
    try {
      const { userId, itemId } = req.params;

      const cart = await Cart.findOneAndUpdate(
        { user: userId },
        {
          $pull: { items: { _id: itemId } },
          $inc: { totalQuantity: -1 },
        },
        { new: true }
      );

      if (!cart) {
        return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
      }

      const deletedItem = cart.items.find(
        (item) => item._id.toString() === itemId
      );

      if (!deletedItem) {
        return res.json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
      }

      await cart.save();

      res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
};
