const authService = require('../services/authService');

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
  const { token } = req.params;
  const { password } = req.body;
  const result = await authService.resetPassword(token, password);
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

module.exports = { register, login, forgotPassword, resetPassword, getProfile, editProfile };
