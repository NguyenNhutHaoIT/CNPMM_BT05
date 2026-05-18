const Product = require('../models/product');
const User = require('../models/user');
const { toPublicUser } = require('../utils/userResponse');
const {
  fileToStoredImage,
  mapProductWithMediaUrls,
  userAvatarUrl,
} = require('../utils/imageStorage');

exports.uploadProductImages = async (files, productData) => {
  try {
    if (!files || files.length === 0) {
      return { EC: 1, EM: 'Vui lòng chọn ít nhất 1 ảnh' };
    }

    const newImages = files.map((file) =>
      fileToStoredImage(file, productData.title || 'Ảnh sản phẩm')
    );

    let product;
    if (productData._id) {
      const existing = await Product.findById(productData._id).select('+images.data');
      if (!existing) return { EC: 1, EM: 'Sản phẩm không tồn tại' };

      existing.images = [...(existing.images || []), ...newImages];
      Object.assign(existing, {
        title: productData.title ?? existing.title,
        slug: productData.slug ?? existing.slug,
        description: productData.description ?? existing.description,
        price: productData.price ?? existing.price,
        originalPrice: productData.originalPrice ?? existing.originalPrice,
        discount: productData.discount ?? existing.discount,
        stock: productData.stock ?? existing.stock,
        category: productData.category ?? existing.category,
        isFeatured: productData.isFeatured ?? existing.isFeatured,
        isNewArrival: productData.isNewArrival ?? existing.isNewArrival,
        isHot: productData.isHot ?? existing.isHot,
        isPromotion: productData.isPromotion ?? existing.isPromotion,
        promotionText: productData.promotionText ?? existing.promotionText,
        updatedAt: new Date(),
      });
      product = await existing.save();
    } else {
      product = await Product.create({
        ...productData,
        images: newImages,
      });
    }

    const lean = product.toObject();
    return {
      EC: 0,
      DT: mapProductWithMediaUrls(lean),
      EM: 'Tải ảnh thành công — đã lưu vào database',
    };
  } catch (err) {
    console.error('Upload product images error:', err);
    return { EC: -1, EM: 'Lỗi tải ảnh sản phẩm' };
  }
};

exports.uploadAvatar = async (userId, file) => {
  try {
    if (!file) {
      return { EC: 1, EM: 'Vui lòng chọn ảnh' };
    }

    const user = await User.findById(userId);
    if (!user) return { EC: 1, EM: 'User không tồn tại' };

    user.avatarImage = {
      data: file.buffer,
      contentType: file.mimetype,
    };
    user.avatar = userAvatarUrl(userId);
    user.updatedAt = new Date();
    await user.save();

    const updated = await User.findById(userId).select(
      '-password -resetPasswordToken -resetPasswordExpire'
    );
    return { EC: 0, DT: toPublicUser(updated), EM: 'Cập nhật avatar thành công — đã lưu vào database' };
  } catch (err) {
    console.error('Upload avatar error:', err);
    return { EC: -1, EM: 'Lỗi cập nhật avatar' };
  }
};

exports.removeAvatar = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { EC: 1, EM: 'User không tồn tại' };

    await User.findByIdAndUpdate(userId, {
      $unset: { avatarImage: 1 },
      $set: { avatar: '', updatedAt: new Date() },
    });

    const updated = await User.findById(userId).select(
      '-password -resetPasswordToken -resetPasswordExpire'
    );
    return { EC: 0, DT: toPublicUser(updated), EM: 'Đã xóa ảnh đại diện' };
  } catch (err) {
    console.error('Remove avatar error:', err);
    return { EC: -1, EM: 'Lỗi xóa avatar' };
  }
};
