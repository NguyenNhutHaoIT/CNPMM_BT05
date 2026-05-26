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

    const exist = await User.findOne({ email: normalizedEmail });
    if (exist) {
      if (exist.isVerified) return { EC: 1, EM: 'Email đã tồn tại' };
      // Nếu chưa verify, cho phép đăng ký lại
      const hash = await bcrypt.hash(password, saltRounds);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      exist.name = trimmedName;
      exist.password = hash;
      exist.activationOTP = otp;
      exist.activationOTPExpire = Date.now() + 15 * 60 * 1000;
      await exist.save();
      
      const html = `<p>Xin chào ${exist.name},</p><p>Mã OTP để kích hoạt tài khoản của bạn là: <b>${otp}</b></p><p>Mã này có hiệu lực trong 15 phút.</p>`;
      await sendMail({ to: exist.email, subject: 'Kích hoạt tài khoản', html });
      return { EC: 0, EM: 'Vui lòng kiểm tra email để nhận mã OTP kích hoạt tài khoản' };
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hash,
      isVerified: false,
      activationOTP: otp,
      activationOTPExpire: Date.now() + 15 * 60 * 1000
    });

    const html = `<p>Xin chào ${user.name},</p><p>Mã OTP để kích hoạt tài khoản của bạn là: <b>${otp}</b></p><p>Mã này có hiệu lực trong 15 phút.</p>`;
    await sendMail({ to: user.email, subject: 'Kích hoạt tài khoản', html });

    return { EC: 0, EM: 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP kích hoạt tài khoản' };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const verifyRegisterOTP = async (email, otp) => {
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      activationOTP: otp,
      activationOTPExpire: { $gt: Date.now() }
    });

    if (!user) return { EC: 1, EM: 'Mã OTP không hợp lệ hoặc đã hết hạn' };

    user.isVerified = true;
    user.activationOTP = undefined;
    user.activationOTPExpire = undefined;
    await user.save();

    return { EC: 0, EM: 'Kích hoạt tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ.' };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return { EC: 1, EM: 'Email hoặc mật khẩu không đúng' };

    if (!user.isVerified) return { EC: 1, EM: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để nhận mã OTP.' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { EC: 1, EM: 'Email hoặc mật khẩu không đúng' };

    const access_token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const redirectUrl = user.role === 'Admin' ? '/admin/profile' : '/user/profile';

    return {
      EC: 0,
      DT: {
        access_token,
        user: toPublicUser(user),
        redirectUrl
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const html = `
      <p>Xin chào ${user.name},</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã OTP của bạn là: <b>${otp}</b></p>
      <p>Mã này có hiệu lực trong 15 phút.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `;

    await sendMail({ to: user.email, subject: 'Mã OTP đặt lại mật khẩu', html });

    return { EC: 0, EM: 'Gửi mã OTP thành công. Vui lòng kiểm tra email.' };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

const resetPassword = async (email, otp, newPassword) => {
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user) return { EC: 1, EM: 'Mã OTP không hợp lệ hoặc đã hết hạn' };

    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    return { EC: 0, EM: 'Đặt lại mật khẩu thành công' };
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


// Admin: Xem danh sách tất cả người dùng
const getUsersList = async () => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpire -avatarImage')
      .sort({ createdAt: -1 });
    return { EC: 0, DT: users, EM: 'Lấy danh sách người dùng thành công' };
  } catch (err) {
    console.error(err);
    return { EC: -1, EM: 'Lỗi server' };
  }
};

module.exports = {
  register,
  verifyRegisterOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  editProfile,
  getUsersList,
};

