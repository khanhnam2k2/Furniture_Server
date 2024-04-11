const Category = require("../models/Category");

module.exports = {
  getCategoryList: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
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
