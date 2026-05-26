import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { productAvatar } from '../utils/imageUrl';

export default function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, cartItemsCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleQtyChange = async (productId, size, color, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    try {
      await updateCartItem(productId, size, color, newQty);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật số lượng');
    }
  };

  const handleRemove = async (productId, size, color) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      try {
        await removeFromCart(productId, size, color);
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa sản phẩm');
      }
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="font-serif text-3xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-3)' }}>
          Hãy khám phá các mẫu giày sneaker, sandal và boots cao cấp tại Luxe Shoes và chọn cho mình sản phẩm ưng ý nhé!
        </p>
        <Link to="/search" className="btn-primary py-3 px-8">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl font-bold mb-8" style={{ color: 'var(--ink)' }}>
        Giỏ hàng của bạn ({cartItemsCount} sản phẩm)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item, idx) => {
            const prod = item.product;
            if (!prod) return null;
            const imgUrl = productAvatar(prod);

            return (
              <div
                key={`${prod._id}-${item.size}-${item.color}-${idx}`}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl transition-all"
                style={{ border: '1px solid var(--sand-2)' }}
              >
                {/* Product image */}
                <div className="w-24 h-28 bg-[var(--sand)] rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={imgUrl}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link to={`/product/${prod.slug}`} className="font-semibold text-base hover:underline" style={{ color: 'var(--ink)' }}>
                        {prod.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(prod._id, item.size, item.color)}
                        className="text-xs hover:text-red-600 transition-colors"
                        style={{ color: 'var(--ink-3)' }}
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs" style={{ color: 'var(--ink-2)' }}>
                      <span>Size: <strong style={{ color: 'var(--ink)' }}>{item.size}</strong></span>
                      <span>Màu: <strong style={{ color: 'var(--ink)' }}>{item.color}</strong></span>
                      <span>Kho: <strong style={{ color: prod.stock > 0 ? 'var(--success)' : '#c62828' }}>{prod.stock} chiếc</strong></span>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex flex-wrap justify-between items-end gap-3 mt-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod._id, item.size, item.color, item.quantity, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-[var(--sand)] transition-colors"
                        style={{ borderColor: 'var(--sand-3)', color: 'var(--ink-2)' }}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod._id, item.size, item.color, item.quantity, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-[var(--sand)] transition-colors"
                        style={{ borderColor: 'var(--sand-3)', color: 'var(--ink-2)' }}
                        disabled={item.quantity >= prod.stock}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                        {((prod.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                          {prod.price?.toLocaleString('vi-VN')}₫ / sp
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart summary */}
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 sticky top-24" style={{ border: '1px solid var(--sand-2)' }}>
          <h2 className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
            Tóm tắt đơn hàng
          </h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between" style={{ color: 'var(--ink-2)' }}>
              <span>Tạm tính</span>
              <span className="font-medium">{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--ink-2)' }}>
              <span>Phí vận chuyển</span>
              <span className="font-medium text-green-600">Miễn phí</span>
            </div>
            <hr className="my-1" style={{ borderColor: 'var(--sand-2)' }} />
            <div className="flex justify-between text-base font-bold">
              <span style={{ color: 'var(--ink)' }}>Tổng tiền</span>
              <span style={{ color: 'var(--accent)' }}>{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="btn-primary py-3.5 w-full mt-2 font-bold"
          >
            Tiến hành thanh toán
          </button>

          <div className="text-center text-xs" style={{ color: 'var(--ink-3)' }}>
            Hỗ trợ thanh toán COD và Cổng VNPay
          </div>
        </div>
      </div>
    </div>
  );
}
