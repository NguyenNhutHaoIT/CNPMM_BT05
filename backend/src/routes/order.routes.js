const express = require('express');
const {
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
} = require('../controllers/orderController');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Helper to check roles
const checkRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ EC: 1, EM: 'Bạn không có quyền truy cập chức năng này' });
  }
  next();
};

// VNPAY callbacks (no auth - must be FIRST to avoid route conflicts with /:id)
router.get('/vnpay/ipn', vnpayIpnHandler);
router.get('/vnpay/return', vnpayReturnHandler);

// Staff & Admin only routes (must be before /:id)
router.get('/admin/all', auth, checkRoles(['Staff', 'Admin']), getAllOrdersAdmin);
router.get('/admin/report', auth, checkRoles(['Staff', 'Admin']), getReportStats);
router.delete('/admin/:id', auth, checkRoles(['Staff', 'Admin']), deleteOrderAdmin);

// Customer routes
router.post('/', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);

// Order detail & actions (parameterized routes last)
router.get('/:id', auth, getOrderById);
router.post('/:id/cancel', auth, cancelOrder);
router.put('/:id/status', auth, checkRoles(['Staff', 'Admin']), updateOrderStatusAdmin);
router.put('/:id/handle-cancel', auth, checkRoles(['Staff', 'Admin']), handleCancelRequestAdmin);

module.exports = router;
