const Category = require("../models/Category");

module.exports = {
  // Hàm lấy danh sách danh mục sp
  getCategoryList: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 4;
      const startIndex = (page - 1) * limit;
      let query = {};
      if (!req.query.page || req.query.page === "undefined") {
        const categories = await Category.find().sort({ createdAt: -1 });
        return res.status(200).json(categories);
      }

      const categories = await Category.find(query)
        .limit(limit)
        .skip(startIndex)
        .sort({ createdAt: -1 });

      const totalCategories = await Category.countDocuments(query);
      const totalPages = Math.ceil(totalCategories / limit);

      res.status(200).json({ categories, totalPages });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  getCategoryById: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findById(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, msg: "Danh mục không tồn tại" });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ success: false, msg: "Some thing went wrong" });
    }
  },
  // Hàm tạo mới danh mục
  createCategory: async (req, res) => {
    const { name, description } = req.body;
    try {
      const category = new Category({
        name,
        description,
      });
      await category.save();
      res
        .status(201)
        .json({ success: true, msg: "Tạo mới danh mục thành công" });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  editCategory: async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      const category = await Category.findById(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, msg: "Danh mục không tồn tại" });
      }

      category.name = name || category.name;
      category.description = description || category.description;

      await category.save();
      res
        .status(200)
        .json({ success: true, msg: "Chỉnh sửa danh mục thành công" });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  // Hàm xóa danh mục
  deleteCategory: async (req, res) => {
    const categoryId = req.params.id;
    try {
      const category = await Category.findOneAndDelete({ _id: categoryId });
      if (!category) {
        return res.status(404).json({ error: "Danh mục không tồn tại" });
      }
      res.status(200).json({ success: true, msg: "Xóa danh mục thành công" });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
};
