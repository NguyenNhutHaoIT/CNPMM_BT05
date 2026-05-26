import React, { useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.EC === 0) {
        setSuccess('Mã OTP đã được gửi đến email của bạn!');
        setStep(2);
      } else {
        setError(res.EM || 'Gửi email thất bại');
      }
    } catch (err) {
      setError(err?.EM || 'Lỗi kết nối. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      if (res.EC === 0) {
        alert('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.');
        nav('/login');
      } else {
        setError(res.EM || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      setError(err?.EM || 'Lỗi kết nối. Vui lòng thử lại');
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
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              {step === 1 ? 'Nhập email để nhận mã OTP' : 'Nhập mã OTP và mật khẩu mới'}
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
            <form onSubmit={handleSendOTP} className="space-y-4">
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                className="form-input text-center text-2xl tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="------"
              />
              <input
                type="password"
                required
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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
              <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
                ← Quay lại đăng nhập
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
