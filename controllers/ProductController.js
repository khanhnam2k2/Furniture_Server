const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const Variant = require("../models/Variant");
module.exports = {
  // Hàm lấy danh sách sp
  getProductList: async (req, res) => {
    try {
      let { category, bestsellers, page = 1, limit = 4 } = req.query;
      let query = {};
      const startIndex = (page - 1) * limit;
      const sortOptions = { createdAt: -1 };
      if (bestsellers) {
        query.bestsellers = true;
      }
      if (category) {
        query.category = category;
      }
      if (req.query.newArrivals) {
        // Sắp xếp theo ngày tạo gần nhất
        limit = 1;
      }
      const price = null;
      if (price) {
        const [minPrice, maxPrice] = price.split("-").map(Number);
        query.$or = [
          {
            $expr: {
              $and: [
                {
                  $or: [
                    {
                      $and: [
                        { $ne: ["$priceSale", ""] }, // Nếu có giá khuyến mãi
                        { $gte: [{ $toDouble: "$priceSale" }, minPrice] },
                        { $lte: [{ $toDouble: "$priceSale" }, maxPrice] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$priceSale", ""] }, // Nếu không có giá khuyến mãi
                        { $ne: ["$price", null] }, // Giá chính không phải null
                        { $ne: ["$price", ""] }, // Giá chính không phải chuỗi rỗng
                        { $gte: [{ $toDouble: "$price" }, minPrice] },
                        { $lte: [{ $toDouble: "$price" }, maxPrice] },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ];
      }
      if (!page) {
        const products = await Product.find(query)
          .populate("category")
          .populate("variants")
          .sort({ createdAt: -1 });
        return res.status(200).json(products);
      }

      const products = await Product.find(query)
        .populate("category")
        .populate("variants")
        .limit(limit)
        .skip(startIndex)
        .sort(sortOptions);

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({ products, totalPages });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json("Some thing went wrong");
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
      res.status(500).json("Some thing went wrong");
    }
  },
  // Hàm lấy ds sp theo danh mục
  getProductById: async (req, res) => {
    try {
      const productId = req.params.id;

      const products = await Product.findById(productId)
        .populate("category")
        .populate("variants");
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json("Some thing went wrong");
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
      res.status(500).json("Some thing went wrong");
    }
  },
  // Hàm tạo mới sản phẩm
  createProduct: async (req, res) => {
    const { name, price, priceSale, variants, category, description } =
      req.body;
    const parsedVariants = JSON.parse(variants);
    let imagesUrl = [];

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => imagesUrl.push(file.filename));
    } else if (req.files) {
      imagesUrl.push(req.files.filename);
    }

    // Tạo một sản phẩm mới

    const newProduct = new Product({
      name,
      imagesUrl,
      price,
      priceSale,
      category,
      description,
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    await newProduct.save();
    // Tạo các biến thể cho sản phẩm
    const variantPromises = parsedVariants.map((variant) => {
      return new Variant({ ...variant, product: newProduct._id }).save();
    });
    const savedVariants = await Promise.all(variantPromises);
    newProduct.variants = savedVariants.map((variant) => variant._id);
    await newProduct.save();
    res.status(201).json(newProduct); // Trả về sản phẩm đã tạo thành công
  },
  editProduct: async (req, res) => {
    const { productId } = req.params;
    const { name, price, priceSale, variants, category, description } =
      req.body;
    console.log(req.body.priceSale);

    try {
      // Tìm sản phẩm bằng ID
      const product = await Product.findById(productId).populate("variants");
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Xử lý hình ảnh nếu có thay đổi
      let imagesUrl = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => imagesUrl.push(file.filename));
      } else if (req.files) {
        imagesUrl.push(req.files.filename);
      }

      // Cập nhật thông tin sản phẩm
      product.name = name || product.name;
      product.price = price || product.price;
      product.priceSale = priceSale;
      product.category = category || product.category;
      product.description = description || product.description;
      product.imagesUrl = imagesUrl.length > 0 ? imagesUrl : product.imagesUrl;

      // Cập nhật sản phẩm trong cơ sở dữ liệu
      await product.save();

      // Xử lý các biến thể
      if (variants) {
        const parsedVariants = JSON.parse(variants);

        // Xóa các biến thể cũ nếu có
        await Variant.deleteMany({ product: product._id });

        // Tạo các biến thể mới
        const variantPromises = parsedVariants.map((variant) => {
          return new Variant({ ...variant, product: product._id }).save();
        });
        const savedVariants = await Promise.all(variantPromises);
        product.variants = savedVariants.map((variant) => variant._id);

        // Cập nhật sản phẩm với các biến thể mới
        await product.save();
      }

      // Trả về sản phẩm đã cập nhật thành công
      res.status(200).json(product);
    } catch (error) {
      console.error("Error editing product:", error);
      res.status(500).json({ error: error.message });
    }
  },
  // Hàm xóa sản phẩm
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;

      // Find the product to get the associated variants and image names
      const product = await Product.findById(productId).populate("variants");
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Delete associated images
      product.imagesUrl.forEach((image) => {
        const imagePath = path.join(__dirname, "../public/images", image); // Path to product images
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the image file
        }
      });

      // Delete associated variants
      await Variant.deleteMany({ _id: { $in: product.variants } });

      // Delete the product
      await Product.findByIdAndDelete(productId);

      res.status(200).json({
        success: true,
        msg: "Product and associated variants deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};
