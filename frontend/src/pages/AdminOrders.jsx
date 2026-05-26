import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const STATUS_MAP = {
  New:       { label: 'Đơn mới',        color: '#1565c0', bg: '#e3f2fd', icon: '📋' },
  Confirmed: { label: 'Đã xác nhận',    color: '#e65100', bg: '#fff3e0', icon: '✅' },
  Preparing: { label: 'Chuẩn bị hàng', color: '#6a1b9a', bg: '#f3e5f5', icon: '📦' },
  Shipping:  { label: 'Đang giao',      color: '#01579b', bg: '#e0f7fa', icon: '🚚' },
  Delivered: { label: 'Đã giao',        color: '#2e7d32', bg: '#e8f5e9', icon: '🎉' },
  Cancelled: { label: 'Đã hủy',         color: '#c62828', bg: '#ffebee', icon: '❌' },
};

const FILTER_TABS = [
  { key: 'All',            label: 'Tất cả',       highlight: false },
  { key: 'CancelRequests', label: '⚠️ Yêu cầu hủy', highlight: true },
  { key: 'New',            label: '📋 Đơn mới',    highlight: false },
  { key: 'Confirmed',      label: '✅ Đã xác nhận', highlight: false },
  { key: 'Preparing',      label: '📦 Chuẩn bị',   highlight: false },
  { key: 'Shipping',       label: '🚚 Đang giao',   highlight: false },
  { key: 'Delivered',      label: '🎉 Đã giao',     highlight: false },
  { key: 'Cancelled',      label: '❌ Đã hủy',      highlight: false },
];

const NEXT_STATUS = {
  New: ['Confirmed', 'Preparing', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Shipping', 'Cancelled'],
  Shipping: ['Delivered', 'Cancelled'],
};

export default function AdminOrders() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.user?.role === 'Admin';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders/admin/all');
      if (res?.EC === 0) setOrders(res.DT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await axios.put(`/orders/${orderId}/status`, { status });
      if (res?.EC === 0) {
        showToast(`Cập nhật trạng thái thành công → ${STATUS_MAP[status]?.label}`);
        fetchAllOrders();
      } else {
        showToast(res?.EM || 'Lỗi cập nhật trạng thái', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này? Thao tác này không thể phục hồi.')) return;
    setUpdatingId(orderId);
    try {
      const res = await axios.delete(`/orders/admin/${orderId}`);
      if (res?.EC === 0) {
        showToast('Đã xóa đơn hàng vĩnh viễn');
        fetchAllOrders();
      } else {
        showToast(res?.EM || 'Lỗi xóa đơn hàng', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelRequest = async (orderId, action) => {
    const actionText = action === 'approve' ? 'CHẤP NHẬN hủy đơn' : 'TỪ CHỐI hủy đơn';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} này?`)) return;
    setUpdatingId(orderId);
    try {
      const res = await axios.put(`/orders/${orderId}/handle-cancel`, { action });
      if (res?.EC === 0) {
        showToast(action === 'approve' ? '✅ Đã chấp nhận hủy đơn' : '✅ Đã từ chối yêu cầu hủy');
        fetchAllOrders();
      } else {
        showToast(res?.EM || 'Lỗi xử lý', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    let pass = true;
    if (filter === 'CancelRequests') pass = order.cancelRequest === true;
    else if (filter !== 'All') pass = order.status === filter;

    if (pass && search.trim()) {
      const q = search.toLowerCase();
      pass = order._id.toLowerCase().includes(q)
        || (order.user?.name || '').toLowerCase().includes(q)
        || (order.user?.email || '').toLowerCase().includes(q);
    }
    return pass;
  });

  const cancelReqCount = orders.filter(o => o.cancelRequest).length;

  const statusSummary = Object.keys(STATUS_MAP).map(key => ({
    key,
    count: orders.filter(o => o.status === key).length,
    ...STATUS_MAP[key]
  }));

  if (loading && orders.length === 0) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`orders-toast ${toast.type === 'error' ? 'orders-toast--error' : ''}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-role-badge">
            {isAdmin ? '👑 Quản trị viên' : '🧑‍💼 Nhân viên'}
          </div>
          <h1 className="admin-page-title">Quản lý đơn hàng</h1>
          <p className="admin-page-subtitle">
            {orders.length} đơn hàng tổng cộng
            {cancelReqCount > 0 && <span className="admin-cancel-req-badge"> · {cancelReqCount} yêu cầu hủy chờ xử lý</span>}
          </p>
        </div>
        <div className="admin-page-header-actions">
          {isAdmin && (
            <Link to="/admin/dashboard" className="admin-dashboard-btn">
              📊 Dashboard
            </Link>
          )}
          <button onClick={fetchAllOrders} className="orders-refresh-btn">
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="admin-status-summary">
        {statusSummary.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`admin-summary-card ${filter === s.key ? 'active' : ''}`}
            style={{ '--card-color': s.color, '--card-bg': s.bg }}
          >
            <span className="admin-summary-icon">{s.icon}</span>
            <span className="admin-summary-count">{s.count}</span>
            <span className="admin-summary-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-tabs">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`admin-filter-tab ${filter === tab.key ? 'active' : ''} ${tab.highlight ? 'highlight' : ''}`}
            >
              {tab.label}
              {tab.key === 'CancelRequests' && cancelReqCount > 0 && (
                <span className="admin-cancel-req-dot">{cancelReqCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="admin-search-wrap">
          <input
            type="text"
            placeholder="Tìm theo mã đơn / tên / email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📁</div>
          <h3 className="orders-empty-title">Không có đơn hàng nào</h3>
          <p className="orders-empty-desc">Không có đơn hàng khớp với điều kiện lọc</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map(order => {
            const statusCfg = STATUS_MAP[order.status] || { label: order.status, color: '#333', bg: '#eee', icon: '?' };
            const isExpanded = expandedId === order._id;
            const isUpdating = updatingId === order._id;
            const nextStatuses = NEXT_STATUS[order.status] || [];

            return (
              <div
                key={order._id}
                className={`admin-order-card ${order.cancelRequest ? 'admin-order-card--cancel-req' : ''}`}
              >
                {/* Cancel Request Banner */}
                {order.cancelRequest && (
                  <div className="admin-cancel-request-banner">
                    <div className="admin-cancel-request-text">
                      ⚠️ <strong>{order.user?.name || 'Khách hàng'}</strong> đang yêu cầu HỦY ĐƠN HÀNG này
                      <span className="admin-cancel-request-time">
                        — Gửi lúc: {order.cancelRequestedAt ? new Date(order.cancelRequestedAt).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                    <div className="admin-cancel-request-actions">
                      <button
                        onClick={() => handleCancelRequest(order._id, 'approve')}
                        disabled={isUpdating}
                        className="admin-cancel-approve-btn"
                      >
                        ✅ Chấp nhận hủy
                      </button>
                      <button
                        onClick={() => handleCancelRequest(order._id, 'reject')}
                        disabled={isUpdating}
                        className="admin-cancel-reject-btn"
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Card Header */}
                <div className="admin-order-header">
                  <div className="admin-order-id-col">
                    <div className="admin-col-label">Mã đơn</div>
                    <div className="admin-order-id">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="admin-order-fullid">{order._id}</div>
                  </div>
                  <div className="admin-order-customer-col">
                    <div className="admin-col-label">Khách hàng</div>
                    <div className="admin-customer-name">{order.user?.name || 'Vô danh'}</div>
                    <div className="admin-customer-email">{order.user?.email || ''}</div>
                    <div className="admin-customer-phone">{order.user?.phone || ''}</div>
                  </div>
                  <div className="admin-order-amount-col">
                    <div className="admin-col-label">Thanh toán</div>
                    <div className="admin-order-amount">{order.totalAmount.toLocaleString('vi-VN')}₫</div>
                    <div className="admin-order-method">{order.paymentMethod}</div>
                    <span className={`admin-payment-status ${order.paymentStatus === 'Paid' ? 'paid' : order.paymentStatus === 'Failed' ? 'failed' : 'pending'}`}>
                      {order.paymentStatus === 'Paid' ? '💳 Đã TT' : order.paymentStatus === 'Failed' ? '❌ Thất bại' : '⏳ Chờ TT'}
                    </span>
                  </div>
                  <div className="admin-order-status-col">
                    <div className="admin-col-label">Trạng thái</div>
                    <span className="admin-status-badge" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <div className="admin-order-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="admin-order-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    className="admin-action-btn admin-action-btn--details"
                  >
                    {isExpanded ? '▲ Ẩn' : '▼ Chi tiết'}
                  </button>

                  <select
                    className="border rounded px-2 py-1.5 text-sm outline-none"
                    defaultValue=""
                    onChange={(e) => {
                      if(e.target.value) {
                        handleUpdateStatus(order._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <option value="" disabled>Chuyển trạng thái...</option>
                    {Object.keys(STATUS_MAP).map(k => (
                      <option key={k} value={k} disabled={k === order.status}>
                        {STATUS_MAP[k].label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={isUpdating}
                    className="admin-action-btn admin-action-btn--cancel"
                  >
                    🗑 Xóa
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="admin-order-details">
                    <div className="order-detail-grid">
                      <div className="order-detail-section">
                        <div className="order-detail-section-title">📍 Địa chỉ giao hàng</div>
                        <div className="order-detail-recipient">
                          {order.shippingAddress.recipientName} — {order.shippingAddress.phone}
                        </div>
                        <div className="order-detail-address">
                          {order.shippingAddress.street}, {order.shippingAddress.ward},
                          {' '}{order.shippingAddress.district}, {order.shippingAddress.province}
                        </div>
                      </div>
                      <div className="order-detail-section">
                        <div className="order-detail-section-title">👟 Sản phẩm</div>
                        <div className="order-detail-items">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-detail-item">
                              <div className="order-detail-item-info">
                                <span className="order-detail-item-name">{item.title}</span>
                                <span className="order-detail-item-meta">Size {item.size} · {item.color}</span>
                              </div>
                              <div className="order-detail-item-price">
                                {item.quantity} × {item.price.toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="order-detail-total">
                          Tổng: <strong>{order.totalAmount.toLocaleString('vi-VN')}₫</strong>
                        </div>
                      </div>
                    </div>
                    {order.confirmedAt && (
                      <div className="order-detail-timeline-info">
                        ✅ Xác nhận lúc: {new Date(order.confirmedAt).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
