const authService = require('../services/authService');

const getUsersList = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ EC: 1, EM: 'Chỉ Admin mới có quyền xem danh sách người dùng' });
  }
  const result = await authService.getUsersList();
  return res.status(200).json(result);
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);
  return res.status(200).json(result);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(200).json(result);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  return res.status(200).json(result);
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await authService.resetPassword(email, otp, newPassword);
  return res.status(200).json(result);
};

const getProfile = async (req, res) => {
  const userId = req.user.id;
  const result = await authService.getProfile(userId);
  return res.status(200).json(result);
};

const editProfile = async (req, res) => {
  const userId = req.user.id;
  const result = await authService.editProfile(userId, req.body);
  return res.status(200).json(result);
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyRegisterOTP(email, otp);
  return res.status(200).json(result);
};

module.exports = { register, verifyOTP, login, forgotPassword, resetPassword, getProfile, editProfile, getUsersList };
