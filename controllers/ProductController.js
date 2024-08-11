const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
module.exports = {
  // Hàm lấy danh sách sp
  getProductList: async (req, res) => {
    try {
      let query = {};
      const page = req.query.page || 1;
      const limit = req.query.limit || 4;
      const startIndex = (page - 1) * limit;

      if (req.query.bestsellers) {
        query = { bestsellers: true };
      }
      if (req.query.newArrivals) {
        const newArrivals = await Product.find()
          .populate("category")
          .sort({ createdAt: -1 })
          .limit(limit); // Lấy 4 sản phẩm mới nhất
        return res.status(200).json(newArrivals);
      }
      if (!req.query.page) {
        const products = await Product.find(query)
          .populate("category")
          .sort({ createdAt: -1 });
        return res.status(200).json(products);
      }

      const products = await Product.find(query)
        .populate("category")
        .limit(limit)
        .skip(startIndex)
        .sort({ createdAt: -1 });

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
      res.status(200).json({ products, totalPages });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  // Hàm lấy ds sp theo danh mục
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
  // Hàm lấy ds sp theo danh mục
  getProductById: async (req, res) => {
    try {
      const productId = req.params.id;

      const products = await Product.findById(productId).populate("category");
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  // Hàm tìm kiếm sp
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
  // Hàm tạo mới sản phẩm
  createProduct: async (req, res) => {
    const { name, price, priceSale, options, category, description } = req.body;
    let imagesUrl = [];

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => imagesUrl.push(file.filename));
    } else if (req.files) {
      imagesUrl.push(req.files.filename);
    }

    let parsedOptions = [];
    let quantityAll = 0;
    if (options) {
      parsedOptions = JSON.parse(options);
      parsedOptions.forEach((option) => {
        const quantityPared = parseInt(option.quantity);
        quantityAll += quantityPared; // Tính tổng quantity từ các option
      });
    }
    // Tạo một sản phẩm mới

    const newProduct = new Product({
      name,
      imagesUrl,
      quantityAll,
      price,
      priceSale,
      category,
      description,
      options: parsedOptions, // Gán sizes đã được phân tích
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct); // Trả về sản phẩm đã tạo thành công
  },
  editProduct: async (req, res) => {
    const { productId } = req.params;
    const { name, price, priceSale, options, category, description } = req.body;
    let imagesUrl = [];
    console.log(productId);

    try {
      // Tìm sản phẩm theo ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Cập nhật thông tin cơ bản
      product.name = name || product.name;
      product.price = price || product.price;
      product.priceSale = priceSale || product.priceSale;
      product.category = category || product.category;
      product.description = description || product.description;

      // Xử lý hình ảnh
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => imagesUrl.push(file.filename));
      } else if (req.files) {
        imagesUrl.push(req.files.filename);
      }
      product.imagesUrl = imagesUrl.length > 0 ? imagesUrl : product.imagesUrl;

      // Xử lý các tùy chọn (options)
      let parsedOptions = [];
      let quantityAll = 0;
      if (options) {
        parsedOptions = JSON.parse(options);
        parsedOptions.forEach((option) => {
          const quantityPared = parseInt(option.quantity);
          quantityAll += quantityPared;
        });
      }
      product.options =
        parsedOptions.length > 0 ? parsedOptions : product.options;
      product.quantityAll = quantityAll || product.quantityAll;

      // Lưu cập nhật vào cơ sở dữ liệu
      const updatedProduct = await product.save();

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  // Hàm xóa sản phẩm
  deleteProduct: async (req, res) => {
    console.log(2);

    try {
      const productId = req.params.id;
      // Tìm sản phẩm để lấy tên hình ảnh
      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({ error: "Sản phẩm không tồn tại" });
      }
      // Xóa hình ảnh từ thư mục public/images
      product.imagesUrl.forEach((image) => {
        const imagePath = path.join(__dirname, "../public/images", image); // Đường dẫn đến hình ảnh của sản phẩm
        fs.unlinkSync(imagePath); // Xóa hình ảnh từ thư mục
      });

      // Xóa sản phẩm từ cơ sở dữ liệu
      await Product.findOneAndDelete({ _id: productId });

      res.status(200).json({ success: true, msg: "Xóa sản phẩm thành công" });
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
};
