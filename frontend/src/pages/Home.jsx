import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../context/AuthContext';

const CATEGORY_ICONS = {
  Sneaker: '👟',
  'Thể thao': '🏃',
  Casual: '👞',
  Boots: '🥾',
  Sandal: '🩴',
  'Công sở': '👔',
};

const HERO_SLIDES = [
  {
    headline: 'Giày Đẳng Cấp\nMùa Hè 2026',
    sub: 'Bộ sưu tập giày sneaker & sandal — Giảm đến 40% toàn bộ BST mới',
    ctaPrimary: 'Khám phá ngay',
    ctaSecondary: 'Bán chạy nhất',
    badge: 'SHOES 2026',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&q=80&auto=format&fit=crop',
  },
  {
    headline: 'Hàng Mới\nVề Tuần Này',
    sub: 'Cập nhật mỗi tuần · Hơn 100 mẫu giày mới từ các thương hiệu hàng đầu',
    ctaPrimary: 'Xem hàng mới',
    ctaSecondary: 'Khuyến mãi',
    badge: 'NEW ARRIVALS',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80&auto=format&fit=crop',
  },
];

function SectionHeader({ label, title, onViewAll }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <div
          className="text-xs font-bold uppercase mb-1.5"
          style={{ color: 'var(--accent)', letterSpacing: 3 }}
        >
          {label}
        </div>
        <h2 className="font-serif text-3xl font-bold" style={{ color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      <button type="button" onClick={onViewAll} className="section-link">
        Xem tất cả <span>→</span>
      </button>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const nav = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, n, h, p, cats] = await Promise.all([
          axios.get('/products/featured?limit=5'),
          axios.get('/products/new?limit=5'),
          axios.get('/products/hot?limit=5'),
          axios.get('/products?isPromotion=true&limit=5'),
          axios.get('/products/categories'),
        ]);
        setFeatured(Array.isArray(f.DT) ? f.DT : f.DT?.items || []);
        setNewProducts(n.DT || []);
        setHotProducts(h.DT || []);
        setPromoProducts(p.DT?.items || []);
        if (cats.EC === 0) setCategories(cats.DT || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuth({ isAuthenticated: false, user: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const slide = HERO_SLIDES[heroIdx];
  const memberRank = auth.user?.memberRank || 'Silver';
  const memberPoints = auth.user?.points ?? 0;

  return (
    <div>
      <section className="hero">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.image}
            className={`hero-slide ${i === heroIdx ? 'hero-slide--active' : ''}`}
            style={{ backgroundImage: `url(${s.image})` }}
            aria-hidden={i !== heroIdx}
          />
        ))}
        <div className="hero-overlay" />

        <div className="hero-inner grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="slide-in" key={heroIdx}>
            <span className="hero-badge">{slide.badge}</span>
            <h1 className="hero-title whitespace-pre-line">{slide.headline}</h1>
            <p className="hero-desc">{slide.sub}</p>
            <div className="hero-actions">
              <button type="button" className="hero-btn-primary" onClick={() => nav('/search')}>
                {slide.ctaPrimary}
              </button>
              <button type="button" className="hero-btn-ghost" onClick={() => nav('/search?isHot=true')}>
                {slide.ctaSecondary}
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3">
            {[
              { n: '500+', l: 'Mẫu giày' },
              { n: '50K+', l: 'Khách hàng' },
              { n: '4.9★', l: 'Đánh giá TB' },
              { n: '30 ngày', l: 'Đổi trả' },
            ].map((s) => (
              <div key={s.l} className="hero-stat">
                <div className="font-serif text-2xl font-bold text-white mb-1">{s.n}</div>
                <div className="text-[11px] uppercase tracking-widest text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setHeroIdx(i)}
              className={`hero-dot ${i === heroIdx ? 'hero-dot--active' : ''}`}
            />
          ))}
        </div>
      </section>

      <div style={{ background: 'var(--sand)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
          {(categories.length ? categories : Object.keys(CATEGORY_ICONS)).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => nav(`/search?category=${encodeURIComponent(cat)}`)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-sm font-medium flex-shrink-0 transition-all border border-[var(--sand-2)] text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <span>{CATEGORY_ICONS[cat] || '👟'}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {auth.isAuthenticated && (
          <div
            className="rounded-3xl p-8 mb-16 flex flex-wrap items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)' }}
          >
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 3 }}
              >
                THÀNH VIÊN · {auth.user?.role}
              </div>
              <h2 className="font-serif text-3xl font-bold text-white mb-2">
                Chào mừng, {auth.user?.name}!
              </h2>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {auth.user?.email}
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Tiếp tục mua sắm để nhận thêm điểm thưởng
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl px-8 py-5 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-xs uppercase tracking-widest mb-1 text-white/55">ĐIỂM TÍCH LŨY</div>
                <div className="font-serif text-3xl font-bold" style={{ color: 'var(--gold)' }}>
                  {memberPoints.toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="rounded-2xl px-8 py-5 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-xs uppercase tracking-widest mb-1 text-white/55">HẠNG</div>
                <div className="font-serif text-3xl font-bold" style={{ color: '#c8a882' }}>
                  {memberRank}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Link to="/profile" className="btn-primary text-center py-3 px-6">
                  Hồ sơ cá nhân
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-ghost text-center py-3 px-6 border-white/30 text-white hover:border-white hover:text-white"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: '✨', title: 'Hàng Mới Về', sub: 'Cập nhật hàng tuần', bg: 'var(--accent-light)', color: 'var(--accent)', q: '?isNew=true' },
            { icon: '▲', title: 'Bán Chạy Nhất', sub: 'Được khách yêu thích', bg: 'var(--sand)', color: 'var(--ink-2)', q: '?isHot=true' },
            { icon: '◆', title: 'Đang Khuyến Mãi', sub: 'Giảm đến 40%', bg: '#eef3ef', color: 'var(--success)', q: '?isPromotion=true' },
          ].map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => nav(`/search${card.q}`)}
              className="text-left rounded-3xl p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: card.bg, border: '1px solid var(--sand-3)' }}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <div className="text-lg font-bold mb-1" style={{ color: card.color }}>{card.title}</div>
              <div className="text-sm" style={{ color: 'var(--ink-3)' }}>{card.sub}</div>
            </button>
          ))}
        </div>

        {promoProducts.length > 0 && (
          <section className="mb-16">
            <SectionHeader label="◆ SALE" title="Đang Khuyến Mãi" onViewAll={() => nav('/search?isPromotion=true')} />
            <div className="grid-products">
              {promoProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {hotProducts.length > 0 && (
          <section className="mb-16">
            <SectionHeader label="▲ HOT PICKS" title="Bán Chạy Nhất" onViewAll={() => nav('/search?isHot=true')} />
            <div className="grid-products">
              {hotProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {newProducts.length > 0 && (
          <section className="mb-16">
            <SectionHeader label="✦ NEW" title="Hàng Mới Về" onViewAll={() => nav('/search?isNew=true')} />
            <div className="grid-products">
              {newProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="mb-16">
            <SectionHeader label="⭐ FEATURED" title="Sản Phẩm Nổi Bật" onViewAll={() => nav('/search?isFeatured=true')} />
            <div className="grid-products">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        <div className="rounded-3xl p-10" style={{ background: 'var(--sand)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🚚', title: 'Miễn phí vận chuyển', sub: 'Đơn hàng từ 299K' },
              { icon: '✅', title: '100% chính hãng', sub: 'Bảo hành chất lượng' },
              { icon: '💳', title: 'Thanh toán an toàn', sub: 'Mã hoá SSL 256-bit' },
              { icon: '🔄', title: 'Đổi trả 30 ngày', sub: 'Không cần lý do' },
            ].map((b) => (
              <div key={b.title} className="text-center">
                <div className="text-4xl mb-3">{b.icon}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>{b.title}</div>
                <div className="text-xs" style={{ color: 'var(--ink-3)' }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
