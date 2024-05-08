const Product = require("../models/Product");

module.exports = {
  getProductList: async (req, res) => {
    try {
      let query = {};
      if (req.query.bestsellers) {
        query = { bestsellers: true };
      }

      if (!req.query.page) {
        const products = await Product.find(query).populate("category");
        return res.status(200).json(products);
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 2;
      const startIndex = (page - 1) * limit;

      const products = await Product.find(query)
        .populate("category")
        .limit(limit)
        .skip(startIndex);

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({ products, totalPages });
    } catch (error) {
      console.error("Error fetching products:", error);
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
    const {
      name,
      rating,
      quantity,
      price,
      materials,
      size,
      category,
      description,
      bestsellers,
    } = req.body;
    let imagesUrl = [];
    req.files.forEach((file) => imagesUrl.push(file.filename)); // Lấy đường dẫn của các hình ảnh đã tải lên
    // Tạo một sản phẩm mới
    const newProduct = new Product({
      name,
      imagesUrl,
      rating,
      quantity,
      price,
      materials,
      size,
      category,
      description,
      bestsellers,
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct); // Trả về sản phẩm đã tạo thành công
  },
};
