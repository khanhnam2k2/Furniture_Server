const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CryptoJs = require("crypto-js");

module.exports = {
  // Hàm đăng ký
  createUser: async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJs.AES.encrypt(
        req.body.password,
        process.env.SECRET
      ).toString(),
    });
    try {
      await newUser.save();
      res.status(201).json({ message: "Người dùng đã được tạo thành công" });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
  //   Hàm đăng nhập
  login: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
          error: "Thông tin xác thực sai. Vui lòng cung cấp một email hợp lệ.",
        });
      }
      const decryptedPassword = CryptoJs.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const decryptedConvert = decryptedPassword.toString(CryptoJs.enc.Utf8);
      if (!decryptedPassword || decryptedConvert !== req.body.password) {
        return res.status(401).json({
          error: "Thông tin xác thực sai. Vui lòng cung cấp mật khẩu hợp lệ.",
        });
      }
      const userToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SEC,
        {
          expiresIn: "7d",
        }
      );
      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;
      res.status(200).json({ ...userData, token: userToken });
    } catch (error) {
      res.status(500).json("Some thing went wrong");
    }
  },
};
