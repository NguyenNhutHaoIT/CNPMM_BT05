const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema(
  {
    recipientName: { type: String, default: '' },
    phone: { type: String, default: '' },
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    ward: { type: String, default: '' },
    street: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  /** Đường dẫn API ảnh đại diện (ảnh binary lưu trong avatarImage) */
  avatar: { type: String, default: '' },
  avatarImage: {
    data: { type: Buffer, select: false },
    contentType: { type: String, default: 'image/jpeg' },
  },
  phone: { type: String, default: '', trim: true },
  role: { type: String, default: 'Member' },
  points: { type: Number, default: 0 },
  memberRank: { type: String, default: 'Silver' },
  shippingAddress: { type: shippingAddressSchema, default: () => ({}) },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function touchUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
