const Category = require("../models/Category");

module.exports = {
  getCategoryList: async (req, res) => {
    try {
      let query = {};
      if (!req.query.page) {
        const categories = await Category.find();
        return res.status(200).json(categories);
      }
      const page = req.query.page || 1;
      const limit = req.query.limit || 3;
      const startIndex = (page - 1) * limit;

      const categories = await Category.find(query)
        .limit(limit)
        .skip(startIndex);

      const totalCategories = await Category.countDocuments(query);
      const totalPages = Math.ceil(totalCategories / limit);

      res.status(200).json({ categories, totalPages });
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
  createCategory: async (req, res) => {
    const { name, description, icon } = req.body;
    try {
      const category = new Category({
        name,
        icon,
        description,
      });
      await category.save();
      res
        .status(201)
        .json({ success: true, msg: "Tạo mới danh mục thành công" });
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
};
