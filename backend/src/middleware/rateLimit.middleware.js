const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử
  message: { EC: 1, EM: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // Tối đa 5 đăng ký từ 1 IP trong 1 giờ
  message: { EC: 1, EM: 'Quá nhiều yêu cầu đăng ký từ IP này, vui lòng thử lại sau 1 giờ' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần request OTP
  message: { EC: 1, EM: 'Quá nhiều yêu cầu về OTP, vui lòng thử lại sau' }
});

module.exports = { loginLimiter, registerLimiter, otpLimiter };
