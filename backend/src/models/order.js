const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true, enum: ['COD', 'VNPay'] },
  paymentStatus: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Paid', 'Failed'] },
  totalAmount: { type: Number, required: true },
  vnpTxnRef: { type: String },
  status: { type: String, required: true, default: 'New', enum: ['New', 'Confirmed', 'Preparing', 'Shipping', 'Delivered', 'Cancelled'] },
  cancelRequest: { type: Boolean, default: false },
  cancelRequestedAt: { type: Date },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function touchUpdated(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
