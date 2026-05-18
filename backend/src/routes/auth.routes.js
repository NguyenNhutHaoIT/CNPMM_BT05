const express = require('express');
const { register, login, forgotPassword, resetPassword, getProfile, editProfile } = require('../controllers/authController');
const { uploadAvatar } = require('../controllers/uploadController');
const { uploadAvatar: uploadMiddleware } = require('../middleware/upload.middleware');
const auth = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, editProfile);
router.post('/upload-avatar', auth, uploadMiddleware, uploadAvatar);

module.exports = router;
