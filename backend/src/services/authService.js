// backend/src/services/authService.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const saltRounds = 10;

const register = async (name, email, password) => {
  try {
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return { EC: 1, EM: "Email đã tồn tại" };

    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email: email.toLowerCase(), password: hash });

    return { EC: 0, DT: { id: user._id, name: user.name, email: user.email } };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: "Lỗi server" };
  }
};

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return { EC: 1, EM: "Email hoặc mật khẩu không đúng" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { EC: 1, EM: "Email hoặc mật khẩu không đúng" };

    const access_token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      EC: 0,
      DT: {
        access_token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points ?? 0,
          memberRank: user.memberRank ?? 'Silver',
        }
      }
    };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: "Lỗi server" };
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return { EC: 1, EM: "Email không tồn tại" };

    // tạo token raw và lưu hashed token vào DB
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const html = `
      <p>Xin chào ${user.name},</p>
      <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong 1 giờ.</p>
      <p><a href="${resetUrl}">Đặt lại mật khẩu</a></p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `;

    await sendMail({ to: user.email, subject: "Yêu cầu đặt lại mật khẩu", html });

    return { EC: 0, EM: "Gửi email reset thành công" };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: "Lỗi server" };
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return { EC: 1, EM: "Token không hợp lệ hoặc đã hết hạn" };

    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { EC: 0, EM: "Reset mật khẩu thành công" };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: "Lỗi server" };
  }
};

const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return { EC: 1, EM: "User không tồn tại" };
    return { EC: 0, DT: user };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: "Lỗi server" };
  }
};

const editProfile = async (userId, payload) => {
  try {
    const update = {};
    if (payload.name) update.name = payload.name;
    if (payload.email) update.email = payload.email.toLowerCase();

    if (payload.password) {
      update.password = await bcrypt.hash(payload.password, saltRounds);
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true
    }).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) return { EC: 1, EM: "User không tồn tại" };

    return { EC: 0, DT: user };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: "Lỗi server" };
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getProfile, editProfile };
