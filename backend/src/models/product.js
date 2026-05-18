const mongoose = require('mongoose');

/** Ảnh lưu binary trong MongoDB */
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true, select: false },
    contentType: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  category: { type: String, required: true },
  /** URL API phục vụ ảnh từ DB — gán khi trả JSON */
  avatar: { type: String, default: '' },
  images: [imageSchema],
  rating: { type: Number, default: 5, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  isHot: { type: Boolean, default: false },
  isPromotion: { type: Boolean, default: false },
  promotionText: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ views: -1 });

productSchema.pre('save', function touchUpdated(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);
