const Product = require('../models/product');
const User = require('../models/user');

const sendImage = (res, data, contentType) => {
  if (!data || !data.length) {
    return res.status(404).json({ EC: 1, EM: 'Không tìm thấy ảnh' });
  }
  res.set('Content-Type', contentType || 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=604800');
  return res.send(data);
};

const getProductImage = async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (Number.isNaN(index) || index < 0) {
      return res.status(400).json({ EC: 1, EM: 'Chỉ số ảnh không hợp lệ' });
    }

    const product = await Product.findById(req.params.id).select('+images.data');
    const image = product?.images?.[index];
    return sendImage(res, image?.data, image?.contentType);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const getProductAvatar = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('+images.data');
    const image = product?.images?.[0];
    return sendImage(res, image?.data, image?.contentType);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const getUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+avatarImage.data');
    const img = user?.avatarImage;
    return sendImage(res, img?.data, img?.contentType);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

module.exports = {
  getProductImage,
  getProductAvatar,
  getUserAvatar,
};
