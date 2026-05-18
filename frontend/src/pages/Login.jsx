import React, { useState, useContext, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { mapUserToAuth } from '../utils/userProfile';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { auth, setAuth } = useContext(AuthContext);
  const nav = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) nav('/', { replace: true });
  }, [auth.isAuthenticated, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', form);
      if (res.EC === 0) {
        const role = (res.DT.user?.role || '').toLowerCase();
        if (role !== 'member') {
          setError('Tài khoản không có quyền thành viên. Vui lòng liên hệ quản trị.');
          return;
        }
        localStorage.setItem('access_token', res.DT.access_token);
        setAuth({ isAuthenticated: true, user: mapUserToAuth(res.DT.user) });
        nav('/', { replace: true });
      } else {
        setError(res.EM || 'Email hoặc mật khẩu không đúng');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, var(--sand) 0%, var(--cream) 100%)' }}
    >
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-3xl p-10 md:p-12"
          style={{ border: '1px solid var(--sand-2)', boxShadow: '0 8px 32px rgba(26,18,9,0.14)' }}
        >
          <div className="text-center mb-9">
            <div className="text-5xl mb-5">◆</div>
            <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
              Đăng nhập
            </h1>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              Đăng nhập thành viên để vào trang chủ cửa hàng giày
            </p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm text-center"
              style={{ background: '#fdecea', color: '#c62828' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email của bạn"
            />
            <input
              type="password"
              required
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mật khẩu"
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Quên mật khẩu?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm" style={{ color: 'var(--ink-3)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
