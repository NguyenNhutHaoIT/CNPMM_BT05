import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { auth, setAuth } = useContext(AuthContext);
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated) {
      nav('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/auth/profile');
        if (res.EC === 0) {
          setUser(res.DT);
          setForm({ name: res.DT.name, email: res.DT.email, password: '', confirmPassword: '' });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const updateData = { name: form.name, email: form.email };
      if (form.password) updateData.password = form.password;

      const res = await axios.put('/auth/profile', updateData);
      if (res.EC === 0) {
        setUser(res.DT);
        setSuccess('Cập nhật thông tin thành công!');
        setForm({ name: res.DT.name, email: res.DT.email, password: '', confirmPassword: '' });
        setIsEditing(false);
        setAuth((prev) => ({
          ...prev,
          user: { ...prev.user, name: res.DT.name, email: res.DT.email },
        }));
      } else {
        setError(res.EM || 'Cập nhật thất bại');
      }
    } catch {
      setError('Lỗi kết nối');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const displayUser = user || auth.user;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: '1px solid var(--sand-2)', boxShadow: '0 2px 12px rgba(26,18,9,0.08)' }}
      >
        <div
          className="px-10 py-12 flex items-center gap-6"
          style={{ background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)', border: '3px solid rgba(255,255,255,0.3)' }}
          >
            {displayUser?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">{displayUser?.name}</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {displayUser?.email}
            </p>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: '#fdecea', color: '#c62828' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: '#e8f5e9', color: '#1b5e20' }}>
              {success}
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
              Thông tin tài khoản
            </h2>
            {!isEditing && (
              <button type="button" onClick={() => setIsEditing(true)} className="btn-primary px-5 py-2.5">
                Chỉnh sửa
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Họ và tên"
              />
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />
              <div className="pt-4 border-t border-sand-2">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--ink-2)' }}>
                  Đổi mật khẩu (tùy chọn)
                </p>
                <input
                  type="password"
                  className="form-input mb-3"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mật khẩu mới"
                />
                <input
                  type="password"
                  className="form-input"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-3">
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-ghost flex-1 py-3"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6" style={{ background: 'var(--sand)' }}>
                <h3
                  className="text-xs font-bold uppercase mb-5"
                  style={{ color: 'var(--ink-3)', letterSpacing: 2 }}
                >
                  Thông tin cá nhân
                </h3>
                {[
                  { l: 'Họ và tên', v: displayUser?.name },
                  { l: 'Email', v: displayUser?.email },
                  { l: 'Vai trò', v: displayUser?.role || 'Thành viên' },
                ].map((f) => (
                  <div key={f.l} className="mb-4">
                    <p className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>{f.l}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{f.v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-6" style={{ background: 'var(--sand)' }}>
                <h3
                  className="text-xs font-bold uppercase mb-5"
                  style={{ color: 'var(--ink-3)', letterSpacing: 2 }}
                >
                  Thống kê
                </h3>
                {[
                  {
                    l: 'Điểm tích lũy',
                    v: (displayUser?.points || 0).toLocaleString('vi-VN'),
                    accent: true,
                  },
                  { l: 'Hạng thành viên', v: 'Gold' },
                  {
                    l: 'Ngày tham gia',
                    v: displayUser?.createdAt
                      ? new Date(displayUser.createdAt).toLocaleDateString('vi-VN')
                      : '—',
                  },
                  { l: 'Trạng thái', v: '✓ Hoạt động' },
                ].map((f) => (
                  <div key={f.l} className="mb-4">
                    <p className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>{f.l}</p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: f.accent ? 'var(--gold)' : 'var(--ink)' }}
                    >
                      {f.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-sand-2">
            <Link to="/" className="btn-ghost inline-flex">
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
