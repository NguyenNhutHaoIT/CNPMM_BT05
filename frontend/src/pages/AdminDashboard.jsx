import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const STATUS_LABELS = {
  New: { label: 'Đơn mới', color: '#1565c0', bg: '#e3f2fd', icon: '📋' },
  Confirmed: { label: 'Đã xác nhận', color: '#e65100', bg: '#fff3e0', icon: '✅' },
  Preparing: { label: 'Chuẩn bị', color: '#6a1b9a', bg: '#f3e5f5', icon: '📦' },
  Shipping: { label: 'Đang giao', color: '#01579b', bg: '#e0f7fa', icon: '🚚' },
  Delivered: { label: 'Đã giao', color: '#2e7d32', bg: '#e8f5e9', icon: '🎉' },
  Cancelled: { label: 'Đã hủy', color: '#c62828', bg: '#ffebee', icon: '❌' },
};

const ROLE_LABELS = {
  Customer: { label: 'Khách hàng', color: '#1565c0', bg: '#e3f2fd' },
  Staff: { label: 'Nhân viên', color: '#6a1b9a', bg: '#f3e5f5' },
  Admin: { label: 'Quản trị viên', color: '#c62828', bg: '#ffebee' },
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="dash-stat-card" style={{ '--stat-color': color }}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-content">
        <div className="dash-stat-value">{value}</div>
        <div className="dash-stat-label">{label}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function MiniBarChart({ data, maxVal }) {
  return (
    <div className="dash-mini-chart">
      {data.map((d, i) => (
        <div key={i} className="dash-mini-bar-wrap" title={`${d.label}: ${d.value.toLocaleString('vi-VN')}₫`}>
          <div
            className="dash-mini-bar"
            style={{ height: maxVal > 0 ? `${Math.max(4, (d.value / maxVal) * 100)}%` : '4%' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders/admin/report');
      if (res?.EC === 0) setReport(res.DT);
      else showToast(res?.EM || 'Lỗi tải báo cáo', 'error');
    } catch (err) {
      showToast('Lỗi kết nối', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await axios.get('/auth/admin/users');
      if (res?.EC === 0) setUsers(res.DT);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
    fetchUsers();
  }, [fetchReport, fetchUsers]);

  // Prepare daily chart data (last 14 days)
  const dailyChartData = (() => {
    if (!report?.dailyRevenue) return [];
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const found = report.dailyRevenue.find(r =>
        r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1 && r._id.day === d.getDate()
      );
      days.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        value: found?.revenue || 0,
        count: found?.count || 0
      });
    }
    return days;
  })();
  const maxDailyRevenue = Math.max(...dailyChartData.map(d => d.value), 1);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const byStatus = report?.byStatus || {};
  const totalOrders = report?.totalOrders || 0;
  const totalRevenue = report?.totalRevenue || 0;
  const cancelRequests = report?.cancelRequests || 0;
  const deliveredCount = byStatus['Delivered'] || 0;

  return (
    <div className="admin-page">
      {toast && (
        <div className={`orders-toast ${toast.type === 'error' ? 'orders-toast--error' : ''}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-role-badge">👑 Quản trị viên</div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Tổng quan hoạt động cửa hàng</p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/admin/orders" className="admin-dashboard-btn">
            📋 Quản lý đơn hàng
          </Link>
          <button onClick={() => { fetchReport(); fetchUsers(); }} className="orders-refresh-btn">
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {[
          { key: 'overview', label: '📊 Tổng quan' },
          { key: 'orders', label: '📦 Đơn hàng' },
          { key: 'users', label: '👥 Người dùng' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`dash-tab ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="dash-tab-content">
          {/* KPI Cards */}
          <div className="dash-kpi-grid">
            <StatCard
              icon="📦"
              label="Tổng đơn hàng"
              value={totalOrders.toLocaleString()}
              sub={`${deliveredCount} đã giao thành công`}
              color="#1565c0"
            />
            <StatCard
              icon="💰"
              label="Doanh thu (đơn đã giao)"
              value={`${(totalRevenue / 1e6).toFixed(1)}M₫`}
              sub={totalRevenue.toLocaleString('vi-VN') + '₫'}
              color="#2e7d32"
            />
            <StatCard
              icon="⚠️"
              label="Yêu cầu hủy đang chờ"
              value={cancelRequests}
              sub={cancelRequests > 0 ? 'Cần xử lý ngay' : 'Không có yêu cầu'}
              color={cancelRequests > 0 ? '#c62828' : '#4a7c59'}
            />
            <StatCard
              icon="👥"
              label="Tổng người dùng"
              value={users.length}
              sub={`${users.filter(u => u.role === 'Customer').length} khách hàng`}
              color="#6a1b9a"
            />
          </div>

          {/* Revenue Chart */}
          <div className="dash-section">
            <div className="dash-section-header">
              <h2 className="dash-section-title">📈 Doanh thu 14 ngày gần nhất</h2>
              <span className="dash-section-sub">Tính từ đơn giao thành công</span>
            </div>
            <div className="dash-chart-wrap">
              <MiniBarChart data={dailyChartData} maxVal={maxDailyRevenue} />
              <div className="dash-chart-labels">
                {dailyChartData.map((d, i) => (
                  <span key={i} className={`dash-chart-label ${i % 2 === 0 ? '' : 'hidden-mobile'}`}>{d.label}</span>
                ))}
              </div>
              <div className="dash-chart-info">
                Tổng {dailyChartData.reduce((a, b) => a + b.count, 0)} đơn giao thành công trong 14 ngày,
                doanh thu {dailyChartData.reduce((a, b) => a + b.value, 0).toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* Payment Stats */}
          {report?.paymentStats?.length > 0 && (
            <div className="dash-section">
              <div className="dash-section-header">
                <h2 className="dash-section-title">💳 Phương thức thanh toán</h2>
              </div>
              <div className="dash-payment-stats">
                {report.paymentStats.map(p => (
                  <div key={p._id} className="dash-payment-card">
                    <div className="dash-payment-method">{p._id === 'COD' ? '💵 COD' : '🏦 VNPay'}</div>
                    <div className="dash-payment-count">{p.count} đơn</div>
                    <div className="dash-payment-total">{(p.total || 0).toLocaleString('vi-VN')}₫</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Products */}
          {report?.topProducts?.length > 0 && (
            <div className="dash-section">
              <div className="dash-section-header">
                <h2 className="dash-section-title">🏆 Top sản phẩm bán chạy</h2>
              </div>
              <div className="dash-top-products">
                {report.topProducts.map((p, idx) => (
                  <div key={p._id} className="dash-top-product-row">
                    <span className={`dash-rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}`}>
                      #{idx + 1}
                    </span>
                    <span className="dash-product-name">{p.title}</span>
                    <span className="dash-product-sold">{p.totalSold} chiếc</span>
                    <span className="dash-product-revenue">{(p.totalRevenue || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Orders ── */}
      {activeTab === 'orders' && (
        <div className="dash-tab-content">
          <div className="dash-section">
            <div className="dash-section-header">
              <h2 className="dash-section-title">📦 Phân bố đơn hàng theo trạng thái</h2>
            </div>
            <div className="dash-status-grid">
              {Object.entries(STATUS_LABELS).map(([key, cfg]) => {
                const count = byStatus[key] || 0;
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                return (
                  <div key={key} className="dash-status-card" style={{ '--status-color': cfg.color, '--status-bg': cfg.bg }}>
                    <div className="dash-status-icon">{cfg.icon}</div>
                    <div className="dash-status-count">{count}</div>
                    <div className="dash-status-label">{cfg.label}</div>
                    <div className="dash-status-bar-wrap">
                      <div className="dash-status-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="dash-status-pct">{pct}%</div>
                  </div>
                );
              })}
            </div>

            <div className="dash-section-footer">
              <Link to="/admin/orders" className="btn-primary py-2.5 px-6 inline-flex">
                Xem & quản lý tất cả đơn hàng →
              </Link>
              {cancelRequests > 0 && (
                <Link to="/admin/orders" className="btn-primary py-2.5 px-6 inline-flex ml-3" style={{ background: '#c62828' }}>
                  ⚠️ {cancelRequests} yêu cầu hủy chờ xử lý
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Users ── */}
      {activeTab === 'users' && (
        <div className="dash-tab-content">
          <div className="dash-section">
            <div className="dash-section-header">
              <h2 className="dash-section-title">👥 Danh sách người dùng</h2>
              <span className="dash-section-sub">{users.length} người dùng</span>
            </div>

            {/* User Role Summary */}
            <div className="dash-user-role-summary">
              {Object.entries(ROLE_LABELS).map(([role, cfg]) => (
                <div key={role} className="dash-role-card" style={{ color: cfg.color, background: cfg.bg }}>
                  <div className="dash-role-count">{users.filter(u => u.role === role).length}</div>
                  <div className="dash-role-label">{cfg.label}</div>
                </div>
              ))}
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8"><div className="spinner" /></div>
            ) : (
              <div className="dash-users-table-wrap">
                <table className="dash-users-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Điểm</th>
                      <th>Hạng</th>
                      <th>Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => {
                      const roleCfg = ROLE_LABELS[user.role] || { label: user.role, color: '#333', bg: '#eee' };
                      return (
                        <tr key={user._id}>
                          <td className="dash-table-idx">{idx + 1}</td>
                          <td className="dash-table-name">
                            <span className="dash-user-avatar-initials">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </span>
                            {user.name}
                          </td>
                          <td className="dash-table-email">{user.email}</td>
                          <td>
                            <span className="dash-role-badge" style={{ color: roleCfg.color, background: roleCfg.bg }}>
                              {roleCfg.label}
                            </span>
                          </td>
                          <td className="dash-table-points">{user.points || 0}</td>
                          <td>
                            <span className={`dash-rank-badge dash-rank-badge--${(user.memberRank || '').toLowerCase()}`}>
                              {user.memberRank || 'Silver'}
                            </span>
                          </td>
                          <td className="dash-table-date">
                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
