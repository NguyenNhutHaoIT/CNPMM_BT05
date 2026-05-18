const Product = require('../models/product');
const User = require('../models/user');
const path = require('path');

// Upload ảnh sản phẩm (nhiều ảnh)
exports.uploadProductImages = async (files, productData) => {
  try {
    if (!files || files.length === 0) {
      return { EC: 1, EM: 'Vui lòng chọn ít nhất 1 ảnh' };
    }

    // Chuyển đổi files thành image objects
    const images = files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      alt: productData.title || 'Product image'
    }));

    // Tạo hoặc cập nhật sản phẩm
    let product;
    if (productData._id) {
      // Update existing product
      product = await Product.findByIdAndUpdate(
        productData._id,
        {
          ...productData,
          images: [...(productData.existingImages || []), ...images]
        },
        { new: true }
      );
    } else {
      // Create new product
      product = await Product.create({
        ...productData,
        images
      });
    }

    return { EC: 0, DT: product, EM: 'Tải ảnh thành công' };
  } catch (err) {
    console.error('Upload product images error:', err);
    return { EC: -1, EM: 'Lỗi tải ảnh sản phẩm' };
  }
};

// Upload avatar user (1 ảnh)
exports.uploadAvatar = async (userId, file) => {
  try {
    if (!file) {
      return { EC: 1, EM: 'Vui lòng chọn ảnh' };
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    return { EC: 0, DT: user, EM: 'Cập nhật avatar thành công' };
  } catch (err) {
    console.error('Upload avatar error:', err);
    return { EC: -1, EM: 'Lỗi cập nhật avatar' };
  }
};
