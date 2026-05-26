import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function VNPaySimulator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount')) || 0;

  const handlePayment = async (success) => {
    if (!orderId) return;

    if (!success) {
      alert('Giao dịch đã bị hủy.');
      navigate('/orders');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`/orders/${orderId}/vnpay-payment`);
      if (res?.EC === 0) {
        alert('Thanh toán thành công qua cổng VNPay!');
        navigate('/orders?payment=success');
      } else {
        alert(res?.EM || 'Lỗi xử lý thanh toán');
        navigate('/orders');
      }
    } catch (err) {
      alert(err.message || 'Lỗi kết nối máy chủ thanh toán');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div>
          {/* Mock VNPay Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="text-xl font-bold tracking-tight text-blue-800 flex items-center gap-1.5">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm">VN</span>
              <span>PAY</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Cổng thanh toán giả lập
            </div>
          </div>

          <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900">
            Chi tiết giao dịch
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Đang thực hiện thanh toán cho cửa hàng <strong className="text-slate-800">LUXE SHOES</strong>
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Mã đơn hàng:</span>
            <span className="font-mono font-bold text-slate-800">{orderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Đơn vị thụ hưởng:</span>
            <span className="font-medium text-slate-800">LUXE SHOES STORE</span>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between text-slate-800 font-bold text-base">
            <span>Số tiền thanh toán:</span>
            <span className="text-blue-600">{amount.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => handlePayment(true)}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
          >
            {loading ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN THÀNH CÔNG'}
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => handlePayment(false)}
            className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
          >
            HỦY GIAO DỊCH
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Đây là môi trường kiểm thử (Sandbox) của VNPay.<br />Không sử dụng thông tin thẻ thực tế của bạn.
        </div>
      </div>
    </div>
  );
}
