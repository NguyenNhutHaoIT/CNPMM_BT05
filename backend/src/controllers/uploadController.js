const uploadService = require('../services/uploadService');

const handleMulterError = (err, res) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ EC: 1, EM: 'Ảnh vượt quá dung lượng cho phép (tối đa 2MB)' });
  }
  if (err?.message) {
    return res.status(400).json({ EC: 1, EM: err.message });
  }
  return res.status(500).json({ EC: -1, EM: 'Lỗi upload' });
};

// Upload ảnh sản phẩm
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ EC: 1, EM: 'Vui lòng chọn ít nhất 1 ảnh' });
    }

    // Validate product data từ form
    const { title, slug, description, price, originalPrice, discount, stock, category } = req.body;
    
    if (!title || !slug || !price || !stock || !category) {
      return res.status(400).json({ EC: 1, EM: 'Thông tin sản phẩm không đủ' });
    }

    const productData = {
      title,
      slug,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      discount: Number(discount) || 0,
      stock: Number(stock),
      category,
      isFeatured: req.body.isFeatured === 'true',
      isNewArrival: req.body.isNewArrival === 'true',
      isHot: req.body.isHot === 'true',
      isPromotion: req.body.isPromotion === 'true',
      promotionText: req.body.promotionText || ''
    };

    const result = await uploadService.uploadProductImages(req.files, productData);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (err) {
    console.error('Upload product error:', err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

// Upload avatar user
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ EC: 1, EM: 'Vui lòng chọn ảnh' });
    }

    const result = await uploadService.uploadAvatar(req.user.id, req.file);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (err) {
    console.error('Upload avatar error:', err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const result = await uploadService.removeAvatar(req.user.id);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (err) {
    console.error('Delete avatar error:', err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

module.exports = {
  uploadProductImages,
  uploadAvatar,
  deleteAvatar,
  handleMulterError,
};
