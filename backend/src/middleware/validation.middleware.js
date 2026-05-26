const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Trả về lỗi đầu tiên tìm thấy
    return res.status(400).json({ EC: 1, EM: errors.array()[0].msg });
  }
  next();
};

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự').isLength({ max: 80 }).withMessage('Họ tên tối đa 80 ký tự'),
  body('email').trim().isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  handleValidationErrors
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  handleValidationErrors
];

const verifyOTPValidation = [
  body('email').trim().isEmail().withMessage('Email không hợp lệ'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Mã OTP không hợp lệ'),
  handleValidationErrors
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Email không hợp lệ'),
  handleValidationErrors
];

const resetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Email không hợp lệ'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Mã OTP không hợp lệ'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
