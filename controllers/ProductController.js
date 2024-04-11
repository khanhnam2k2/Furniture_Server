const Product = require("../models/Product");

module.exports = {
  getProductList: async (req, res) => {
    try {
      let query = {};
      if (req.query.bestsellers) {
        query = { bestsellers: true };
      }
      const products = await Product.find(query).populate("category");
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },

  getProductByCategory: async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      let query = { category: categoryId };
      if (req.query.bestsellers) {
        query.bestsellers = true;
      }
      const products = await Product.find(query);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  searchProduct: async (req, res) => {
    try {
      const productName = req.query.name;
      const regex = new RegExp(productName, "i"); // Tạo biểu thức chính quy không phân biệt hoa thường
      const products = await Product.find({ name: regex }).populate("category");
      res.status(200).json(products);
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
