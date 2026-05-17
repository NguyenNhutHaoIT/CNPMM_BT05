import React, { useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.EC === 0) {
        setSuccess('Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn!');
        setEmail('');
      } else {
        setError(res.EM || 'Gửi email thất bại');
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
            <div className="text-5xl mb-5">🔑</div>
            <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
              Quên mật khẩu?
            </h1>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>Nhập email để nhận link khôi phục</p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm text-center"
              style={{ background: '#fdecea', color: '#c62828' }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm text-center"
              style={{ background: '#e8f5e9', color: '#1b5e20' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? 'Đang gửi...' : 'Gửi link khôi phục'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm" style={{ color: 'var(--ink-3)' }}>
            <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
              ← Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
