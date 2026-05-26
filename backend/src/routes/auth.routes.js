const express = require('express');
const { register, verifyOTP, login, forgotPassword, resetPassword, getProfile, editProfile, getUsersList } = require('../controllers/authController');
const { uploadAvatar, deleteAvatar, handleMulterError } = require('../controllers/uploadController');
const { uploadAvatar: uploadMiddleware } = require('../middleware/upload.middleware');
const auth = require('../middleware/auth.middleware');
const { loginLimiter, registerLimiter, otpLimiter } = require('../middleware/rateLimit.middleware');
const { registerValidation, loginValidation, verifyOTPValidation, forgotPasswordValidation, resetPasswordValidation } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', registerLimiter, registerValidation, register);
router.post('/verify-otp', otpLimiter, verifyOTPValidation, verifyOTP);
router.post('/login', loginLimiter, loginValidation, login);
router.post('/forgot-password', otpLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', otpLimiter, resetPasswordValidation, resetPassword);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, editProfile);
router.post('/upload-avatar', auth, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return handleMulterError(err, res);
    return uploadAvatar(req, res);
  });
});
router.delete('/avatar', auth, deleteAvatar);

// Admin only: danh sách người dùng
router.get('/admin/users', auth, getUsersList);

module.exports = router;

