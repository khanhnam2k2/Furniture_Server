// authMiddleware.js

const jwt = require("jsonwebtoken");
function checkRoleAdmin() {
  return async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token không hợp lệ" });
    }

    jwt.verify(token.split(" ")[1], process.env.JWT_SEC, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token không hợp lệ" });
      }
      if (decoded.role === 0) {
        next();
      } else {
        res.status(403).json({ error: "Không có quyền truy cập" });
      }
    });
  };
}

module.exports = checkRoleAdmin;
