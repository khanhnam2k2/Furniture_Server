const Product = require("../models/Product");

module.exports = {
  getProductList: async (req, res) => {
    try {
      const products = await Product.find().populate("category");
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  getProductSellers: async (req, res) => {
    try {
      const productSellers = await Product.find({ bestsellers: true }).populate(
        "category"
      );
      res.status(200).json(productSellers);
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  createProduct: async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res
        .status(201)
        .json({ success: true, msg: "Tạo mới sản phẩm thành công" });
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
};
