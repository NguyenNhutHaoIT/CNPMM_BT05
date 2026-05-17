
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ EC: 1, EM: "Bạn chưa truyền Access Token" });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ EC: 2, EM: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = auth;