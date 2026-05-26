import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

export default function Checkout() {
  const { cart, fetchCart } = useContext(CartContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prefill form from user profile shippingAddress if available
    if (auth.user?.shippingAddress) {
      const addr = auth.user.shippingAddress;
      setForm({
        recipientName: addr.recipientName || auth.user.name || '',
        phone: addr.phone || auth.user.phone || '',
        province: addr.province || '',
        district: addr.district || '',
        ward: addr.ward || '',
        street: addr.street || '',
      });
    } else if (auth.user) {
      setForm((prev) => ({
        ...prev,
        recipientName: auth.user.name || '',
        phone: auth.user.phone || '',
      }));
    }
  }, [auth.user]);

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
          Không có sản phẩm nào để thanh toán
        </h2>
        <button onClick={() => navigate('/cart')} className="btn-primary px-6 py-2.5">
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const { recipientName, phone, province, district, ward, street } = form;
    if (!recipientName || !phone || !province || !district || !ward || !street) {
      setError('Vui lòng nhập đầy đủ thông tin giao hàng.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/orders', {
        shippingAddress: form,
        paymentMethod,
      });

      if (res?.EC === 0) {
        // Clear cart in context
        await fetchCart();

        if (paymentMethod === 'VNPay' && res.DT.paymentUrl) {
          // Redirect to simulated VNPay gateway page
          window.location.href = res.DT.paymentUrl;
        } else {
          alert('Đặt hàng thành công! Cảm ơn quý khách đã mua sắm.');
          navigate('/orders');
        }
      } else {
        setError(res?.EM || 'Lỗi khi tạo đơn hàng');
      }
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl font-bold mb-8" style={{ color: 'var(--ink)' }}>
        Thanh toán đơn hàng
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping address form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 flex flex-col gap-5" style={{ border: '1px solid var(--sand-2)' }}>
          <h2 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
            📍 Thông tin nhận hàng
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-2)' }}>
                Tên người nhận
              </label>
              <input
                type="text"
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-2)' }}>
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-2)' }}>
                Tỉnh / Thành phố
              </label>
              <input
                type="text"
                name="province"
                value={form.province}
                onChange={handleChange}
                className="form-input"
                placeholder="Ví dụ: Hà Nội"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-2)' }}>
                Quận / Huyện
              </label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                className="form-input"
                placeholder="Ví dụ: Cầu Giấy"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-2)' }}>
                Phường / Xã
              </label>
              <input
                type="text"
                name="ward"
                value={form.ward}
                onChange={handleChange}
                className="form-input"
                placeholder="Ví dụ: Dịch Vọng"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-2)' }}>
              Địa chỉ chi tiết (Số nhà, tên đường)
            </label>
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              className="form-input"
              placeholder="Ví dụ: 123 Đường Cầu Giấy"
              required
            />
          </div>

          <hr className="my-2" style={{ borderColor: 'var(--sand-2)' }} />

          <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--ink)' }}>
            💳 Phương thức thanh toán
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <label
              className="flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
              style={{
                borderColor: paymentMethod === 'COD' ? 'var(--accent)' : 'var(--sand-2)',
                backgroundColor: paymentMethod === 'COD' ? 'var(--accent-light)' : '#fff',
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setForm && setPaymentMethod('COD')}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <div>
                  <div className="font-semibold text-sm">Thanh toán COD</div>
                  <div className="text-xs" style={{ color: 'var(--ink-3)' }}>Thanh toán tiền mặt khi giao hàng</div>
                </div>
              </div>
              <span className="text-xl">🚚</span>
            </label>

            <label
              className="flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
              style={{
                borderColor: paymentMethod === 'VNPay' ? 'var(--accent)' : 'var(--sand-2)',
                backgroundColor: paymentMethod === 'VNPay' ? 'var(--accent-light)' : '#fff',
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VNPay"
                  checked={paymentMethod === 'VNPay'}
                  onChange={() => setForm && setPaymentMethod('VNPay')}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <div>
                  <div className="font-semibold text-sm">Cổng VNPay</div>
                  <div className="text-xs" style={{ color: 'var(--ink-3)' }}>Thanh toán online qua thẻ ngân hàng/QR</div>
                </div>
              </div>
              <span className="text-xl">💳</span>
            </label>
          </div>
        </div>

        {/* Sidebar Order Summary */}
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4" style={{ border: '1px solid var(--sand-2)' }}>
          <h2 className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
            Đơn hàng của bạn
          </h2>

          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={`${item.product?._id}-${idx}`} className="flex justify-between items-start text-xs gap-3">
                <div className="flex-1">
                  <div className="font-semibold truncate max-w-[180px]">{item.product?.title}</div>
                  <div style={{ color: 'var(--ink-3)' }}>
                    Size: {item.size} | Màu: {item.color} | SL: {item.quantity}
                  </div>
                </div>
                <div className="font-semibold" style={{ color: 'var(--ink)' }}>
                  {((item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                </div>
              </div>
            ))}
          </div>

          <hr style={{ borderColor: 'var(--sand-2)' }} />

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between" style={{ color: 'var(--ink-2)' }}>
              <span>Tổng phụ</span>
              <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--ink-2)' }}>
              <span>Phí vận chuyển</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            <hr style={{ borderColor: 'var(--sand-2)' }} />
            <div className="flex justify-between text-sm font-bold">
              <span>Tổng thanh toán</span>
              <span style={{ color: 'var(--accent)' }}>{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3.5 w-full mt-2 font-bold flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="spinner w-4 h-4 border-2" />
            ) : paymentMethod === 'VNPay' ? (
              '💳 Thanh toán VNPay'
            ) : (
              '🛍️ Đặt hàng COD'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
