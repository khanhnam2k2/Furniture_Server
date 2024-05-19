const User = require("../models/User");

module.exports = {
  updateUserProfile: async (req, res) => {
    const userId = req.params.id;
    const { username, avatar } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.json({ error: "Không tìm thấy người dùng" });
      }

      if (username) {
        user.username = username;
      }

      if (avatar) {
        user.avatar = avatar;
      }

      // Lưu lại thay đổi
      await user.save();

      res.status(200).json("Hồ sơ được cập nhật thành công");
    } catch (error) {
      res.status(500).json("Một số thứ đã xảy ra sai sót");
    }
  },
};
