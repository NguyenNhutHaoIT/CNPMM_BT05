import React from 'react';

export default function QuantityStepper({ value, max, disabled, onChange }) {
  const atMin = value <= 1;
  const atMax = value >= max;

  return (
    <div className="space-y-2">
      <div
        className="inline-flex items-center rounded-xl overflow-hidden"
        style={{ background: 'var(--sand)', border: '1px solid var(--sand-2)' }}
      >
        <button
          type="button"
          aria-label="Giảm số lượng"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={disabled || atMin}
          className="w-11 h-11 text-xl font-medium transition-colors disabled:opacity-35 disabled:cursor-not-allowed hover:bg-white/80"
          style={{ color: 'var(--ink-2)' }}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isNaN(n)) return;
            onChange(Math.min(max, Math.max(1, n)));
          }}
          className="min-w-[56px] w-14 text-center text-lg font-bold bg-transparent border-0 outline-none"
          style={{ color: 'var(--ink)' }}
        />
        <button
          type="button"
          aria-label="Tăng số lượng"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || atMax}
          className="w-11 h-11 text-xl font-medium transition-colors disabled:opacity-35 disabled:cursor-not-allowed hover:bg-white/80"
          style={{ color: 'var(--ink-2)' }}
        >
          +
        </button>
      </div>
      {!disabled && max > 0 && (
        <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
          Tối đa {max} sản phẩm còn trong kho
        </p>
      )}
    </div>
  );
}
