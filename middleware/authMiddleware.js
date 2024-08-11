// authMiddleware.js

const jwt = require("jsonwebtoken");
function checkAuth() {
  return async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token không hợp lệ" });
    }

    jwt.verify(token.split(" ")[0], process.env.JWT_SEC, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token không hợp lệ" });
      }

      req.userId = decoded.id; // Lưu thông tin người dùng vào req để sử dụng ở các middleware hoặc route tiếp theo
      next();
    });
  };
}

function checkRoleAdmin() {
  return async (req, res, next) => {
    console.log(22);
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token không hợp lệ" });
    }

    jwt.verify(token.split(" ")[1], process.env.JWT_SEC, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token không hợp lệ" });
      }

      if (decoded.role === 0) {
        req.user = decoded; // Lưu thông tin người dùng vào req để sử dụng ở các route hoặc middleware khác
        next();
      } else {
        res.status(403).json({ error: "Không có quyền truy cập" });
      }
    });
  };
}

module.exports = { checkAuth, checkRoleAdmin };
