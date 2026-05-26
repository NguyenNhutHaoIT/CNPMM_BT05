const qs = require('qs');
const crypto = require('crypto');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const { generateVnpayUrl } = require('../utils/vnpay');

// Helper to auto confirm orders older than 30 minutes
const checkAndAutoConfirm = async (order) => {
  if (!order) return order;
  if (order.status === 'New' && (Date.now() - new Date(order.createdAt).getTime()) > 30 * 60 * 1000) {
    order.status = 'Confirmed';
    order.confirmedAt = new Date();
    await order.save();
  }
  return order;
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(200).json({ EC: 1, EM: 'Vui lòng cung cấp địa chỉ giao hàng và phương thức thanh toán' });
    }

    const { recipientName, phone, province, district, ward, street } = shippingAddress;
    if (!recipientName || !phone || !province || !district || !ward || !street) {
      return res.status(200).json({ EC: 1, EM: 'Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng' });
    }

    if (!['COD', 'VNPay'].includes(paymentMethod)) {
      return res.status(200).json({ EC: 1, EM: 'Phương thức thanh toán không hợp lệ' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ EC: 1, EM: 'Giỏ hàng của bạn đang trống' });
    }

    // Check stock & build order items list
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(200).json({ EC: 1, EM: 'Một số sản phẩm trong giỏ không còn tồn tại' });
      }

      if (product.stock < item.quantity) {
        return res.status(200).json({
          EC: 1,
          EM: `Sản phẩm "${product.title}" chỉ còn ${product.stock} chiếc trong kho, không đủ đáp ứng số lượng ${item.quantity}`
        });
      }

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Assign truncated transaction reference for VNPAY (24-char hex ObjectId → 20 chars)
    const txnRef = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    const vnpTxnRef = txnRef.substring(0, 20);

    // Create Order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      totalAmount,
      status: 'New',
      vnpTxnRef: paymentMethod === 'VNPay' ? vnpTxnRef : undefined
    });

    // Clear Cart
    cart.items = [];
    await cart.save();

    // Trigger auto confirm after 30 minutes in memory
    const orderId = order._id;
    setTimeout(async () => {
      try {
        const o = await Order.findById(orderId);
        if (o && o.status === 'New') {
          o.status = 'Confirmed';
          o.confirmedAt = new Date();
          await o.save();
          console.log(`[Auto-Confirm] Đơn hàng ${orderId} tự động xác nhận sau 30 phút`);
        }
      } catch (err) {
        console.error(`Auto-confirm timer error for order ${orderId}:`, err);
      }
    }, 30 * 60 * 1000);

    let paymentUrl = '';
    if (paymentMethod === 'VNPay') {
      // Generate VNPAY sandbox URL using the stored vnpTxnRef
      paymentUrl = generateVnpayUrl(order.vnpTxnRef, order.totalAmount, req.ip);
    }

    return res.status(200).json({
      EC: 0,
      DT: {
        order,
        paymentUrl
      },
      EM: 'Đặt hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    // Check auto confirmation
    const checkedOrders = [];
    for (const order of orders) {
      checkedOrders.push(await checkAndAutoConfirm(order));
    }

    return res.status(200).json({
      EC: 0,
      DT: checkedOrders,
      EM: 'Lấy danh sách đơn hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    let order = await Order.findById(id).populate('user', 'name email phone');
    if (!order) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy đơn hàng' });
    }

    // Authorization: User must be owner, or Staff, or Admin
    if (order.user._id.toString() !== userId && !['Staff', 'Admin'].includes(role)) {
      return res.status(403).json({ EC: 1, EM: 'Bạn không có quyền xem đơn hàng này' });
    }

    order = await checkAndAutoConfirm(order);

    return res.status(200).json({
      EC: 0,
      DT: order,
      EM: 'Lấy chi tiết đơn hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let order = await Order.findById(id);
    if (!order) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy đơn hàng' });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ EC: 1, EM: 'Bạn không có quyền thực hiện hành động này' });
    }

    order = await checkAndAutoConfirm(order);

    const timeDiffMs = Date.now() - new Date(order.createdAt).getTime();
    const canCancelDirectly = timeDiffMs <= 30 * 60 * 1000; // <= 30 mins

    if (canCancelDirectly) {
      if (['New', 'Confirmed'].includes(order.status)) {
        order.status = 'Cancelled';
        order.cancelRequest = false;
        await order.save();

        // Restore stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, sold: -item.quantity }
          });
        }

        return res.status(200).json({
          EC: 0,
          DT: order,
          EM: 'Đã hủy đơn hàng thành công'
        });
      } else if (order.status === 'Preparing') {
        // Direct cancel not possible if already Preparing, switch to request cancel
        order.cancelRequest = true;
        order.cancelRequestedAt = new Date();
        await order.save();
        return res.status(200).json({
          EC: 0,
          DT: order,
          EM: 'Đã gửi yêu cầu hủy đơn cho shop vì shop đang chuẩn bị hàng'
        });
      } else {
        return res.status(200).json({
          EC: 1,
          EM: 'Không thể hủy đơn hàng ở trạng thái hiện tại'
        });
      }
    } else {
      // Over 30 mins: can only request cancel if status is Preparing
      if (order.status === 'Preparing') {
        order.cancelRequest = true;
        order.cancelRequestedAt = new Date();
        await order.save();
        return res.status(200).json({
          EC: 0,
          DT: order,
          EM: 'Đã gửi yêu cầu hủy đơn cho shop (chờ xét duyệt)'
        });
      } else {
        return res.status(200).json({
          EC: 1,
          EM: 'Đã quá 30 phút từ lúc đặt đơn, bạn chỉ có thể gửi yêu cầu hủy khi shop đang chuẩn bị hàng'
        });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

// IPN (Instant Payment Notification) handler from VNPAY sandbox
const vnpayIpnHandler = async (req, res) => {
  try {
    // VNPAY sends data as query parameters (GET) or body (POST). Use both.
    const data = { ...req.query, ...req.body };
    const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash } = data;
    if (!vnp_TxnRef) {
      return res.status(200).json({ RspCode: '99', Message: 'Missing transaction reference' });
    }
    // Verify checksum
    const crypto = require('crypto');
    const secret = process.env.VNP_HASH_SECRET || 'BWPI0J4GAHSGY5832X5P8B3YVTD7ZPP4';

    let sorted = {};
    let str = [];
    for (let key in data) {
      if (data.hasOwnProperty(key) && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
      sorted[str[i]] = encodeURIComponent(data[str[i]]).replace(/%20/g, "+");
    }

    const qs = require('qs');
    const signData = qs.stringify(sorted, { encode: false });

    const checksum = crypto.createHmac('sha512', secret).update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (checksum.toLowerCase() !== (vnp_SecureHash || '').toLowerCase()) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
    }

    const order = await Order.findOne({ vnpTxnRef: vnp_TxnRef });
    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // Check if order payment status already updated
    if (order.paymentStatus !== 'Pending') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    // Update payment status based on response code
    order.paymentStatus = vnp_ResponseCode === '00' ? 'Paid' : 'Failed';
    await order.save();

    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// Staff & Admin functions
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });

    const checkedOrders = [];
    for (const order of orders) {
      checkedOrders.push(await checkAndAutoConfirm(order));
    }

    return res.status(200).json({
      EC: 0,
      DT: checkedOrders,
      EM: 'Lấy toàn bộ đơn hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Confirmed', 'Preparing', 'Shipping', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(200).json({ EC: 1, EM: 'Trạng thái cập nhật không hợp lệ' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy đơn hàng' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (status === 'Confirmed') {
      order.confirmedAt = new Date();
    }

    // If transitioning to Cancelled, restore stock (if not already done)
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity }
        });
      }
    }

    await order.save();

    return res.status(200).json({
      EC: 0,
      DT: order,
      EM: 'Cập nhật trạng thái đơn hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const handleCancelRequestAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(200).json({ EC: 1, EM: 'Hành động không hợp lệ' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy đơn hàng' });
    }

    if (!order.cancelRequest) {
      return res.status(200).json({ EC: 1, EM: 'Đơn hàng này không có yêu cầu hủy' });
    }

    if (action === 'approve') {
      order.status = 'Cancelled';
      order.cancelRequest = false;
      await order.save();

      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity }
        });
      }

      return res.status(200).json({
        EC: 0,
        DT: order,
        EM: 'Đã chấp nhận yêu cầu hủy đơn hàng'
      });
    } else {
      order.cancelRequest = false;
      await order.save();
      return res.status(200).json({
        EC: 0,
        DT: order,
        EM: 'Đã từ chối yêu cầu hủy đơn hàng'
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

// Handler for VNPAY return URL (redirect from VNPAY after payment)
const vnpayReturnHandler = async (req, res) => {
  try {
    const data = { ...req.query };
    const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash } = data;

    if (!vnp_TxnRef) {
      return res.status(200).json({ EC: 1, EM: 'Missing transaction reference' });
    }

    // Verify checksum
    const crypto = require('crypto');
    const secret = process.env.VNP_HASH_SECRET || 'BWPI0J4GAHSGY5832X5P8B3YVTD7ZPP4';

    let sorted = {};
    let str = [];
    for (let key in data) {
      if (data.hasOwnProperty(key) && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
      sorted[str[i]] = encodeURIComponent(data[str[i]]).replace(/%20/g, "+");
    }

    const qs = require('qs');
    const signData = qs.stringify(sorted, { encode: false });

    const checksum = crypto.createHmac('sha512', secret).update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (checksum.toLowerCase() !== (vnp_SecureHash || '').toLowerCase()) {
      console.warn('[VNPAY Return] Invalid checksum');
      return res.status(200).json({ EC: 1, EM: 'Invalid checksum' });
    }

    const order = await Order.findOne({ vnpTxnRef: vnp_TxnRef });
    if (!order) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy đơn hàng' });
    }

    // Update payment status only if not already set
    if (order.paymentStatus === 'Pending') {
      order.paymentStatus = vnp_ResponseCode === '00' ? 'Paid' : 'Failed';
      await order.save();
    }

    return res.status(200).json({ EC: 0, DT: order, EM: 'OK' });
  } catch (err) {
    console.error('[VNPAY Return]', err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

// ─── Báo cáo thống kê (Staff & Admin) ───────────────────────────────────────
const getReportStats = async (req, res) => {
  try {
    const role = req.user.role;
    if (!['Staff', 'Admin'].includes(role)) {
      return res.status(403).json({ EC: 1, EM: 'Bạn không có quyền xem báo cáo' });
    }

    // Tổng đơn theo từng trạng thái
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byStatus = {};
    statusCounts.forEach(s => { byStatus[s._id] = s.count; });

    // Tổng doanh thu từ đơn đã giao (Delivered)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Tổng số đơn, đơn yêu cầu hủy
    const totalOrders = await Order.countDocuments();
    const cancelRequests = await Order.countDocuments({ cancelRequest: true });

    // Doanh thu theo ngày (30 ngày gần nhất, đơn Delivered)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top 5 sản phẩm bán chạy nhất (từ đơn hàng)
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Thống kê thanh toán
    const paymentStats = await Order.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]);

    return res.status(200).json({
      EC: 0,
      DT: {
        totalOrders,
        totalRevenue,
        cancelRequests,
        byStatus,
        dailyRevenue,
        topProducts,
        paymentStats
      },
      EM: 'Lấy báo cáo thống kê thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy đơn hàng' });
    }

    // Restore stock if the order wasn't cancelled yet
    if (order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity }
        });
      }
    }

    await Order.findByIdAndDelete(id);

    return res.status(200).json({
      EC: 0,
      EM: 'Xóa đơn hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  vnpayIpnHandler,
  vnpayReturnHandler,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  handleCancelRequestAdmin,
  getReportStats,
  deleteOrderAdmin
};
