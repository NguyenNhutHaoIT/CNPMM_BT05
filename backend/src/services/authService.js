const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');
const { toPublicUser } = require('../utils/userResponse');

const saltRounds = 10;
const PHONE_RE = /^(0|\+84)[0-9]{8,10}$/;

const normalizePhone = (phone) => (phone || '').replace(/\s/g, '').trim();

const register = async (name, email, password) => {
  try {
    const trimmedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      return { EC: 1, EM: 'Họ tên phải có ít nhất 2 ký tự' };
    }
    if (!normalizedEmail) return { EC: 1, EM: 'Email không hợp lệ' };
    if (!password || password.length < 6) {
      return { EC: 1, EM: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    const exist = await User.findOne({ email: normalizedEmail });
    if (exist) return { EC: 1, EM: 'Email đã tồn tại' };

    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hash,
    });

    return { EC: 0, DT: toPublicUser(user) };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return { EC: 1, EM: 'Email hoặc mật khẩu không đúng' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { EC: 1, EM: 'Email hoặc mật khẩu không đúng' };

    const access_token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      EC: 0,
      DT: {
        access_token,
        user: toPublicUser(user),
      },
    };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return { EC: 1, EM: 'Email không tồn tại' };

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const html = `
      <p>Xin chào ${user.name},</p>
      <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong 1 giờ.</p>
      <p><a href="${resetUrl}">Đặt lại mật khẩu</a></p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `;

    await sendMail({ to: user.email, subject: 'Yêu cầu đặt lại mật khẩu', html });

    return { EC: 0, EM: 'Gửi email reset thành công' };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { EC: 1, EM: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return { EC: 1, EM: 'Token không hợp lệ hoặc đã hết hạn' };

    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { EC: 0, EM: 'Reset mật khẩu thành công' };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      '-password -resetPasswordToken -resetPasswordExpire'
    );
    if (!user) return { EC: 1, EM: 'User không tồn tại' };
    return { EC: 0, DT: toPublicUser(user) };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const editProfile = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { EC: 1, EM: 'User không tồn tại' };

    if (payload.name !== undefined) {
      const name = String(payload.name).trim();
      if (name.length < 2) return { EC: 1, EM: 'Họ tên phải có ít nhất 2 ký tự' };
      if (name.length > 80) return { EC: 1, EM: 'Họ tên tối đa 80 ký tự' };
      user.name = name;
    }

    if (payload.email !== undefined) {
      const email = String(payload.email).trim().toLowerCase();
      if (!email.includes('@')) return { EC: 1, EM: 'Email không hợp lệ' };
      if (email !== user.email) {
        const taken = await User.findOne({ email, _id: { $ne: userId } });
        if (taken) return { EC: 1, EM: 'Email đã được sử dụng bởi tài khoản khác' };
        user.email = email;
      }
    }

    if (payload.phone !== undefined) {
      const phone = normalizePhone(payload.phone);
      if (phone && !PHONE_RE.test(phone)) {
        return { EC: 1, EM: 'Số điện thoại không hợp lệ (VD: 0901234567)' };
      }
      user.phone = phone;
    }

    if (payload.shippingAddress && typeof payload.shippingAddress === 'object') {
      const addr = payload.shippingAddress;
      const shipPhone = normalizePhone(addr.phone);
      if (shipPhone && !PHONE_RE.test(shipPhone)) {
        return { EC: 1, EM: 'Số điện thoại nhận hàng không hợp lệ' };
      }
      user.shippingAddress = {
        recipientName: (addr.recipientName || '').trim(),
        phone: shipPhone,
        province: (addr.province || '').trim(),
        district: (addr.district || '').trim(),
        ward: (addr.ward || '').trim(),
        street: (addr.street || '').trim(),
      };
    }

    const newPassword = payload.newPassword || payload.password;
    if (newPassword) {
      if (!payload.currentPassword) {
        return { EC: 1, EM: 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu' };
      }
      const match = await bcrypt.compare(payload.currentPassword, user.password);
      if (!match) return { EC: 1, EM: 'Mật khẩu hiện tại không đúng' };
      if (newPassword.length < 6) {
        return { EC: 1, EM: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
      }
      if (payload.confirmPassword && newPassword !== payload.confirmPassword) {
        return { EC: 1, EM: 'Xác nhận mật khẩu mới không khớp' };
      }
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    await user.save();

    const updated = await User.findById(userId).select(
      '-password -resetPasswordToken -resetPasswordExpire'
    );
    return { EC: 0, DT: toPublicUser(updated), EM: 'Cập nhật hồ sơ thành công' };
  } catch (err) {
    if (err.code === 11000) {
      return { EC: 1, EM: 'Email đã được sử dụng' };
    }
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  editProfile,
};
