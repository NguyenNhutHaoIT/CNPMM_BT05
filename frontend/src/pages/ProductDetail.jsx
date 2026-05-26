import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import ProductSwiper from '../components/product/ProductSwiper';
import StockStatus from '../components/product/StockStatus';
import QuantityStepper from '../components/product/QuantityStepper';
import { productAvatar } from '../utils/imageUrl';

function Badge({ type }) {
  if (type === 'new') return <span className="tag tag-new">✦ Mới</span>;
  if (type === 'hot') return <span className="tag tag-hot">▲ Hot</span>;
  if (type === 'sale') return <span className="tag tag-sale">◆ Sale</span>;
  return null;
}

function StarRating({ value }) {
  const stars = Math.round(value || 4.5);
  return (
    <span style={{ color: '#c49a2a', fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/products/${slug}`);
        if (res.EC === 0) {
          const prod = res.DT.product;
          setProduct(prod);
          setSimilar(res.DT.similar || []);
          setQuantity(1);
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
        } else {
          setError(res.EM || 'Không tìm thấy sản phẩm');
        }
      } catch {
        setError('Lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product?.stock) return;
    if (!auth.isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      navigate('/login');
      return;
    }
    if (!selectedSize || !selectedColor) {
      alert('Vui lòng chọn Size và Màu sắc.');
      return;
    }
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      alert(err.message || 'Lỗi thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl font-semibold mb-2" style={{ color: 'var(--ink-2)' }}>
          Không tìm thấy sản phẩm
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-3)' }}>{error}</p>
        <Link to="/search" className="btn-primary">
          ← Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const discount = product.discount || 0;
  const inStock = product.stock > 0;
  const lineTotal = (product.price || 0) * quantity;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="flex flex-wrap items-center gap-2 mb-8 text-sm" style={{ color: 'var(--ink-3)' }}>
        <Link to="/" className="hover:underline" style={{ color: 'var(--accent)' }}>
          Trang chủ
        </Link>
        <span>›</span>
        <Link
          to={`/search?category=${encodeURIComponent(product.category)}`}
          className="hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          {product.category}
        </Link>
        <span>›</span>
        <span className="font-medium truncate max-w-[200px] sm:max-w-none" style={{ color: 'var(--ink)' }}>
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-14">
        <ProductSwiper images={product.images || []} title={product.title} />

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
            style={{ background: 'var(--sand)', border: '1px solid var(--sand-2)' }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest m-0 mb-1" style={{ color: 'var(--ink-3)' }}>
                Danh mục
              </p>
              <Link
                to={`/search?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-2 font-semibold text-sm hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                <span className="text-lg">👟</span>
                {product.category}
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.isNewArrival && <Badge type="new" />}
              {product.isHot && <Badge type="hot" />}
              {product.isPromotion && <Badge type="sale" />}
            </div>
          </div>

          <div>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold leading-tight mb-3" style={{ color: 'var(--ink)' }}>
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: 'var(--ink-3)' }}>
              <StarRating value={product.rating} />
              <span>({product.rating || 4.5})</span>
              {product.reviews > 0 && (
                <>
                  <span>·</span>
                  <span>{product.reviews} đánh giá</span>
                </>
              )}
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-3 rounded-2xl p-4"
            style={{ background: '#fff', border: '1px solid var(--sand-2)' }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest m-0 mb-1" style={{ color: 'var(--ink-3)' }}>
                Đã bán
              </p>
              <p className="text-xl font-bold m-0" style={{ color: 'var(--ink)' }}>
                {(product.sold || 0).toLocaleString('vi-VN')}
              </p>
              <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--ink-3)' }}>
                sản phẩm
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest m-0 mb-1" style={{ color: 'var(--ink-3)' }}>
                Tồn kho
              </p>
              <p className="text-xl font-bold m-0" style={{ color: inStock ? 'var(--success)' : '#c62828' }}>
                {product.stock}
              </p>
              <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--ink-3)' }}>
                còn lại
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'var(--accent-light)' }}>
            <p className="text-xs mb-2 m-0" style={{ color: 'var(--ink-3)' }}>
              Giá bán
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                {product.price?.toLocaleString('vi-VN')}₫
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg line-through" style={{ color: 'var(--ink-3)' }}>
                  {product.originalPrice?.toLocaleString('vi-VN')}₫
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-bold text-white px-3 py-1 rounded-full" style={{ background: 'var(--accent)' }}>
                  -{discount}%
                </span>
              )}
            </div>
            {product.promotionText && (
              <p className="text-sm font-medium mt-2 m-0" style={{ color: 'var(--success)' }}>
                🎁 {product.promotionText}
              </p>
            )}
            {quantity > 1 && inStock && (
              <p className="text-sm mt-3 m-0 font-semibold" style={{ color: 'var(--ink-2)' }}>
                Tạm tính ({quantity} sp):{' '}
                <span style={{ color: 'var(--accent)' }}>{lineTotal.toLocaleString('vi-VN')}₫</span>
              </p>
            )}
          </div>

          <StockStatus stock={product.stock} />

          {(!auth.isAuthenticated || auth.user?.role === 'Customer') && (
            <>
              {product.sizes?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-semibold mb-2 m-0" style={{ color: 'var(--ink-2)' }}>
                    Chọn Size:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all"
                        style={{
                          backgroundColor: selectedSize === s ? 'var(--accent)' : '#fff',
                          color: selectedSize === s ? '#fff' : 'var(--ink-2)',
                          borderColor: selectedSize === s ? 'var(--accent)' : 'var(--sand-3)',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-semibold mb-2 m-0" style={{ color: 'var(--ink-2)' }}>
                    Chọn Màu Sắc:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className="px-4 py-2 flex items-center justify-center rounded-lg border text-sm font-medium transition-all"
                        style={{
                          backgroundColor: selectedColor === c ? 'var(--accent-light)' : '#fff',
                          color: selectedColor === c ? 'var(--accent)' : 'var(--ink-2)',
                          borderColor: selectedColor === c ? 'var(--accent)' : 'var(--sand-3)',
                          fontWeight: selectedColor === c ? '600' : 'normal',
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold mb-2 m-0" style={{ color: 'var(--ink-2)' }}>
                  Số lượng mua
                </p>
                <QuantityStepper
                  value={quantity}
                  max={Math.max(product.stock, 1)}
                  disabled={!inStock}
                  onChange={setQuantity}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="btn-primary flex-1 py-4"
                  style={{ background: addedToCart ? 'var(--success)' : undefined }}
                >
                  {addedToCart
                    ? `✓ Đã thêm ${quantity} vào giỏ`
                    : inStock
                      ? `🛒 Thêm ${quantity} vào giỏ hàng`
                      : 'Hết hàng'}
                </button>
                <button type="button" className="btn-ghost px-5 text-xl" title="Yêu thích" aria-label="Yêu thích">
                  ♡
                </button>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🚚', t: 'Miễn phí vận chuyển' },
              { icon: '✅', t: 'Hàng chính hãng' },
              { icon: '🔄', t: 'Đổi trả 30 ngày' },
              { icon: '💳', t: 'Thanh toán an toàn' },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-2)' }}>
                <span className="text-lg">{b.icon}</span>
                {b.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {product.description && (
        <section
          className="rounded-3xl p-8 lg:p-10 mb-14 bg-white"
          style={{ border: '1px solid var(--sand-2)' }}
        >
          <h2 className="font-serif text-2xl font-bold mb-5 m-0" style={{ color: 'var(--ink)' }}>
            Mô tả sản phẩm
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-line m-0" style={{ color: 'var(--ink-2)' }}>
            {product.description}
          </p>
        </section>
      )}

      {similar.length > 0 && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p
                className="text-xs font-bold uppercase m-0 mb-1"
                style={{ color: 'var(--accent)', letterSpacing: 3 }}
              >
                GỢI Ý CHO BẠN
              </p>
              <h2 className="font-serif text-3xl font-bold m-0" style={{ color: 'var(--ink)' }}>
                Sản phẩm tương tự
              </h2>
              <p className="text-sm mt-2 m-0" style={{ color: 'var(--ink-3)' }}>
                Cùng danh mục{' '}
                <Link
                  to={`/search?category=${encodeURIComponent(product.category)}`}
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {product.category}
                </Link>
              </p>
            </div>
            <Link
              to={`/search?category=${encodeURIComponent(product.category)}`}
              className="section-link"
            >
              Xem tất cả <span>→</span>
            </Link>
          </div>
          <div className="grid-products">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
