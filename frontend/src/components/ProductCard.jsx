import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const discount = product.discount || 0;
  const inStock = product.stock > 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-card-media">
        <img
          src={
            hovered && product.images?.[1]
              ? product.images[1].url
              : product.images?.[0]?.url || 'https://via.placeholder.com/600x750?text=No+Image'
          }
          alt={product.title}
          className="transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isNewArrival && <span className="tag tag-new">✦ Mới</span>}
          {product.isHot && <span className="tag tag-hot">▲ Hot</span>}
          {product.isPromotion && <span className="tag tag-sale">◆ Sale</span>}
        </div>

        {discount > 0 && (
          <div
            className="absolute top-2.5 right-2.5 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'var(--accent)' }}
          >
            -{discount}%
          </div>
        )}

        {!inStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(26,18,9,0.48)' }}
          >
            <span
              className="bg-white text-xs font-bold px-4 py-1.5 rounded-full"
              style={{ color: 'var(--ink)' }}
            >
              Hết hàng
            </span>
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 right-0 p-3 transition-all duration-200"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(6px)' }}
        >
          <div
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center"
            style={{ background: 'var(--accent)' }}
          >
            Xem chi tiết
          </div>
        </div>
      </div>

      <div className="product-card-body">
        <p className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>
          {product.category}
        </p>

        <h3
          className="product-card-title"
          style={{ color: hovered ? 'var(--accent)' : 'var(--ink)' }}
        >
          {product.title}
        </h3>

        <div className="product-card-meta flex items-center gap-2 text-xs" style={{ color: 'var(--ink-3)' }}>
          <span style={{ color: '#c49a2a', letterSpacing: 1 }}>
            {'★'.repeat(Math.round(product.rating || 4.5))}
          </span>
          <span>{product.rating || 4.5}</span>
          <span>·</span>
          <span>Bán {(product.sold || 0).toLocaleString('vi-VN')}</span>
        </div>

        <div className="product-card-footer">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base font-bold" style={{ color: 'var(--accent)' }}>
              {product.price?.toLocaleString('vi-VN')}₫
            </span>
            {product.originalPrice && (
              <span className="price-original">
                {product.originalPrice?.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          <button
            type="button"
            className="w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: hovered ? 'var(--accent)' : 'var(--accent-light)',
              color: hovered ? '#fff' : 'var(--accent)',
            }}
            onClick={(e) => e.preventDefault()}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Link>
  );
}
