import React from 'react';

const LEVELS = {
  out: {
    icon: '✗',
    label: 'Hết hàng',
    sub: 'Sản phẩm tạm thời không còn — vui lòng quay lại sau',
    bg: '#fdecea',
    border: '#f5b8b8',
    color: '#c62828',
  },
  low: {
    icon: '⚠',
    label: 'Sắp hết hàng',
    sub: null,
    bg: '#fff8e6',
    border: '#f0d78c',
    color: '#9a6700',
  },
  in: {
    icon: '✓',
    label: 'Còn hàng',
    sub: null,
    bg: '#f0faf4',
    border: '#a5d6b0',
    color: 'var(--success)',
  },
};

export default function StockStatus({ stock = 0 }) {
  const level = stock <= 0 ? 'out' : stock <= 10 ? 'low' : 'in';
  const cfg = LEVELS[level];

  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.7)', color: cfg.color }}
        >
          {cfg.icon}
        </span>
        <div>
          <p className="text-sm font-bold m-0" style={{ color: cfg.color }}>
            {level === 'out'
              ? cfg.label
              : level === 'low'
                ? `${cfg.label} — chỉ còn ${stock} sản phẩm`
                : `Còn ${stock} sản phẩm trong kho`}
          </p>
          <p className="text-xs mt-1 m-0" style={{ color: 'var(--ink-3)' }}>
            {cfg.sub || (level === 'in' ? 'Giao hàng trong 1–3 ngày làm việc' : 'Đặt ngay để không bỏ lỡ')}
          </p>
        </div>
      </div>
    </div>
  );
}
