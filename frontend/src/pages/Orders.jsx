import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';

const STATUS_STEPS = [
  { key: 'New', label: 'Đơn mới', icon: '📋', desc: 'Đơn hàng vừa được đặt' },
  { key: 'Confirmed', label: 'Đã xác nhận', icon: '✅', desc: 'Shop đã xác nhận đơn' },
  { key: 'Preparing', label: 'Chuẩn bị hàng', icon: '📦', desc: 'Shop đang đóng gói' },
  { key: 'Shipping', label: 'Đang giao', icon: '🚚', desc: 'Shipper đang giao hàng' },
  { key: 'Delivered', label: 'Đã giao', icon: '🎉', desc: 'Giao hàng thành công' },
];

const PAYMENT_STATUS_LABEL = {
  Paid: { label: 'Đã thanh toán', cls: 'payment-badge--paid' },
  Failed: { label: 'Thất bại', cls: 'payment-badge--failed' },
  Pending: { label: 'Chờ thanh toán', cls: 'payment-badge--pending' },
};

const ORDER_STATUS_FILTER = [
  { key: 'all', label: 'Tất cả' },
  { key: 'New', label: 'Đơn mới' },
  { key: 'Confirmed', label: 'Đã xác nhận' },
  { key: 'Preparing', label: 'Chuẩn bị' },
  { key: 'Shipping', label: 'Đang giao' },
  { key: 'Delivered', label: 'Đã giao' },
  { key: 'Cancelled', label: 'Đã hủy' },
];

function StatusTimeline({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  if (status === 'Cancelled') {
    return (
      <div className="order-cancelled-banner">
        <span className="order-cancelled-icon">❌</span>
        <div>
          <div className="order-cancelled-title">Đơn hàng đã bị hủy</div>
          <div className="order-cancelled-sub">Đơn hàng này không thể tiếp tục xử lý</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPending = idx > currentIdx;
        return (
          <div key={step.key} className={`order-timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`order-timeline-line ${isCompleted ? 'completed' : ''}`} />
            )}
            <div className="order-timeline-dot">
              <span className="order-timeline-icon">
                {isCompleted ? '✓' : step.icon}
              </span>
            </div>
            <div className="order-timeline-label">
              <div className="order-timeline-step-name">{step.label}</div>
              {isActive && <div className="order-timeline-step-desc">{step.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CountdownBadge({ createdAt }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      const remainMs = 30 * 60 * 1000 - elapsed;
      if (remainMs <= 0) { setRemaining(''); return; }
      const mins = Math.floor(remainMs / 60000);
      const secs = Math.floor((remainMs % 60000) / 1000);
      setRemaining(`${mins}:${String(secs).padStart(2, '0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [createdAt]);

  if (!remaining) return null;
  return (
    <span className="cancel-countdown">
      ⏱ Còn {remaining} để hủy trực tiếp
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders/my-orders');
      if (res?.EC === 0) setOrders(res.DT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (orderId, orderStatus) => {
    const msg = orderStatus === 'Preparing'
      ? 'Gửi yêu cầu hủy đơn cho shop? Shop sẽ xem xét và phản hồi.'
      : 'Bạn chắc chắn muốn hủy đơn hàng này?';
    if (!window.confirm(msg)) return;

    setCancelling(orderId);
    try {
      const res = await axios.post(`/orders/${orderId}/cancel`);
      if (res?.EC === 0) {
        showToast(res.EM || 'Thành công');
        fetchOrders();
      } else {
        showToast(res?.EM || 'Lỗi khi hủy đơn hàng', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const canCancelDirectly = (order) => {
    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    return elapsed <= 30 * 60 * 1000 && ['New', 'Confirmed'].includes(order.status);
  };
  const canRequestCancel = (order) => order.status === 'Preparing' && !order.cancelRequest;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Toast */}
      {toast && (
        <div className={`orders-toast ${toast.type === 'error' ? 'orders-toast--error' : ''}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">Đơn hàng của tôi</h1>
          <p className="orders-subtitle">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
        </div>
        <button onClick={fetchOrders} className="orders-refresh-btn" title="Làm mới">
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Bar */}
      <div className="orders-stats-bar">
        {[
          { label: 'Tổng đơn', value: orders.length, color: '#2a2320' },
          { label: 'Đang xử lý', value: orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length, color: '#ed6c02' },
          { label: 'Đã giao', value: orders.filter(o => o.status === 'Delivered').length, color: '#4a7c59' },
          { label: 'Đã hủy', value: orders.filter(o => o.status === 'Cancelled').length, color: '#d32f2f' },
        ].map(stat => (
          <div key={stat.label} className="orders-stat-card">
            <div className="orders-stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="orders-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-tabs">
        {ORDER_STATUS_FILTER.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`orders-filter-tab ${filter === tab.key ? 'active' : ''}`}
          >
            {tab.label}
            <span className="orders-filter-count">
              {tab.key === 'all' ? orders.length : orders.filter(o => o.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h3 className="orders-empty-title">
            {filter === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng nào'}
          </h3>
          <p className="orders-empty-desc">
            {filter === 'all' ? 'Hãy đặt hàng ngay để nhận các ưu đãi hấp dẫn!' : 'Không có đơn hàng nào ở trạng thái này'}
          </p>
          {filter === 'all' && (
            <a href="/search" className="btn-primary py-2.5 px-6 mt-4 inline-flex">
              Mua sắm ngay
            </a>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => {
            const isExpanded = expandedId === order._id;
            const isCancelling = cancelling === order._id;
            const payBadge = PAYMENT_STATUS_LABEL[order.paymentStatus] || PAYMENT_STATUS_LABEL.Pending;

            return (
              <div key={order._id} className={`order-card ${order.status === 'Cancelled' ? 'order-card--cancelled' : ''} ${order.cancelRequest ? 'order-card--cancel-request' : ''}`}>

                {/* Cancel Request Banner */}
                {order.cancelRequest && (
                  <div className="order-cancel-request-banner">
                    ⌛ Yêu cầu hủy đơn đang chờ shop xét duyệt...
                  </div>
                )}

                {/* Order Card Header */}
                <div className="order-card-header">
                  <div className="order-card-id-block">
                    <span className="order-card-id-label">Mã đơn</span>
                    <span className="order-card-id">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="order-card-date-block">
                    <span className="order-card-date-label">Ngày đặt</span>
                    <span className="order-card-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="order-card-amount-block">
                    <span className="order-card-amount-label">Tổng tiền</span>
                    <span className="order-card-amount">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="order-card-status-block">
                    <span className={`order-status-badge order-status-badge--${order.status.toLowerCase()}`}>
                      {order.status === 'New' && '📋 Đơn mới'}
                      {order.status === 'Confirmed' && '✅ Đã xác nhận'}
                      {order.status === 'Preparing' && '📦 Chuẩn bị hàng'}
                      {order.status === 'Shipping' && '🚚 Đang giao'}
                      {order.status === 'Delivered' && '🎉 Đã giao'}
                      {order.status === 'Cancelled' && '❌ Đã hủy'}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="order-card-timeline-wrap">
                  <StatusTimeline status={order.status} />
                </div>

                {/* Footer */}
                <div className="order-card-footer">
                  <div className="order-card-payment-info">
                    <span className={`payment-badge ${payBadge.cls}`}>{payBadge.label}</span>
                    <span className="order-card-payment-method">{order.paymentMethod}</span>
                    {canCancelDirectly(order) && <CountdownBadge createdAt={order.createdAt} />}
                  </div>

                  <div className="order-card-actions">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order._id)}
                      className="order-action-btn order-action-btn--ghost"
                    >
                      {isExpanded ? 'Ẩn chi tiết ▲' : 'Xem chi tiết ▼'}
                    </button>

                    {canCancelDirectly(order) && (
                      <button
                        onClick={() => handleCancel(order._id, order.status)}
                        disabled={isCancelling}
                        className="order-action-btn order-action-btn--cancel"
                      >
                        {isCancelling ? '...' : '🗑 Hủy đơn'}
                      </button>
                    )}

                    {canRequestCancel(order) && (
                      <button
                        onClick={() => handleCancel(order._id, order.status)}
                        disabled={isCancelling}
                        className="order-action-btn order-action-btn--request-cancel"
                      >
                        {isCancelling ? '...' : '📨 Yêu cầu hủy'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="order-card-details">
                    <div className="order-detail-grid">
                      {/* Địa chỉ */}
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

                      {/* Sản phẩm */}
                      <div className="order-detail-section">
                        <div className="order-detail-section-title">🛍 Sản phẩm</div>
                        <div className="order-detail-items">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-detail-item">
                              <div className="order-detail-item-info">
                                <span className="order-detail-item-name">{item.title}</span>
                                <span className="order-detail-item-meta">
                                  Size {item.size} · {item.color}
                                </span>
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

                    {/* Timeline info */}
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
