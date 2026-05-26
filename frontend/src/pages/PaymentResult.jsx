import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    const txnRef = searchParams.get('vnp_TxnRef');

    if (!txnRef) {
      setStatus('failed');
      return;
    }

    const isSuccess = responseCode === '00';
    setStatus(isSuccess ? 'success' : 'failed');

    // Notify backend of payment result so it updates order.paymentStatus
    const params = {};
    searchParams.forEach((val, key) => { params[key] = val; });

    axios.get('/orders/vnpay/return', { params }).catch(() => {});
  }, [searchParams]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {status === 'loading' && (
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--ink-2)' }}>Đang xử lý kết quả thanh toán...</p>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#16a34a', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Thanh toán thành công!
          </h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
            Mã giao dịch: <strong>{searchParams.get('vnp_TxnRef')}</strong>
          </p>
          <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
            Số tiền:{' '}
            <strong>
              {(Number(searchParams.get('vnp_Amount') || 0) / 100).toLocaleString('vi-VN')}₫
            </strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary px-6 py-3" onClick={() => navigate('/orders')}>
              Xem đơn hàng
            </button>
            <button
              className="btn-outline px-6 py-3"
              onClick={() => navigate('/')}
              style={{ border: '1.5px solid var(--accent)', color: 'var(--accent)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: '1rem' }}>❌</div>
          <h1 style={{ color: '#dc2626', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Thanh toán thất bại
          </h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
            Mã lỗi VNPAY:{' '}
            <strong>{searchParams.get('vnp_ResponseCode') || 'Không xác định'}</strong>
          </p>
          <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary px-6 py-3" onClick={() => navigate('/checkout')}>
              Thử lại
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ border: '1.5px solid var(--ink-3)', color: 'var(--ink-2)', borderRadius: 8, background: 'transparent', cursor: 'pointer', padding: '0.75rem 1.5rem' }}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
