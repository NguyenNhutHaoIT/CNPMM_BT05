import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (res.EC === 0) {
        setSuccess('Vui lòng kiểm tra email để lấy mã OTP xác nhận.');
        setStep(2);
      } else {
        setError(res.EM || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err?.EM || 'Lỗi kết nối. Vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/verify-otp', {
        email: form.email,
        otp: form.otp
      });

      if (res.EC === 0) {
        alert('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        nav('/login');
      } else {
        setError(res.EM || 'Mã OTP không hợp lệ');
      }
    } catch (err) {
      setError(err?.EM || 'Lỗi kết nối. Vui lòng thử lại sau');
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
            <div className="text-5xl mb-5">✦</div>
            <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
              {step === 1 ? 'Tạo tài khoản' : 'Xác thực OTP'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              {step === 1 ? 'Tham gia để nhận ưu đãi đặc biệt' : 'Mã OTP 6 số đã được gửi tới email của bạn'}
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

          {success && step === 2 && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm text-center"
              style={{ background: '#e8f5e9', color: '#1b5e20' }}
            >
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                required
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Họ và tên"
              />
              <input
                type="email"
                required
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />
              <input
                type="password"
                required
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
              />
              <input
                type="password"
                required
                className="form-input"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Xác nhận mật khẩu"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                required
                className="form-input text-center text-2xl tracking-widest"
                maxLength={6}
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                placeholder="------"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
                {loading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-800"
              >
                Quay lại
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center mt-8 text-sm" style={{ color: 'var(--ink-3)' }}>
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
                Đăng nhập
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
