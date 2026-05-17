import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';

const PER_PAGE = 12;

function FilterSection({ title, children }) {
  return (
    <div className="mb-7">
      <div
        className="text-xs font-bold uppercase mb-3"
        style={{ color: 'var(--ink-3)', letterSpacing: 2 }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer text-sm" style={{ color: 'var(--ink-2)' }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: `2px solid ${checked ? 'var(--accent)' : 'var(--sand-3)'}`,
          background: checked ? 'var(--accent)' : '#fff',
        }}
      >
        {checked && <span className="text-white text-xs font-black">✓</span>}
      </button>
      {label}
    </label>
  );
}

function readFiltersFromParams(searchParams) {
  return {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    inStock: searchParams.get('inStock') === 'true',
    isNew: searchParams.get('isNew') === 'true',
    isHot: searchParams.get('isHot') === 'true',
    isPromotion: searchParams.get('isPromotion') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  };
}

function buildParamsFromFilters(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.priceMin) params.set('priceMin', filters.priceMin);
  if (filters.priceMax) params.set('priceMax', filters.priceMax);
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.isNew) params.set('isNew', 'true');
  if (filters.isHot) params.set('isHot', 'true');
  if (filters.isPromotion) params.set('isPromotion', 'true');
  if (filters.isFeatured) params.set('isFeatured', 'true');
  params.set('sort', filters.sort);
  params.set('page', String(filters.page));
  params.set('limit', String(PER_PAGE));
  return params;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [draft, setDraft] = useState(() => readFiltersFromParams(searchParams));

  useEffect(() => {
    setDraft(readFiltersFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/products/categories');
        if (res.EC === 0) setCategories(res.DT || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const apiParams = buildParamsFromFilters(readFiltersFromParams(searchParams));
      const res = await axios.get(`/products?${apiParams}`);
      if (res.EC === 0) {
        setProducts(res.DT.items || []);
        setTotal(res.DT.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFilters = (overrides = {}, resetPage = true) => {
    const next = { ...readFiltersFromParams(searchParams), ...draft, ...overrides };
    if (resetPage) next.page = 1;
    setSearchParams(buildParamsFromFilters(next), { replace: true });
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams({ sort: '-createdAt', page: '1', limit: String(PER_PAGE) }), {
      replace: true,
    });
  };

  const filters = readFiltersFromParams(searchParams);
  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
          {filters.q ? `Kết quả cho "${filters.q}"` : 'Cửa hàng giày dép'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-3)' }}>
          Tìm thấy <strong style={{ color: 'var(--ink)' }}>{total}</strong> sản phẩm
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside>
          <div
            className="bg-white rounded-3xl p-7 lg:sticky lg:top-24"
            style={{ border: '1px solid var(--sand-2)' }}
          >
            <div className="flex justify-between items-center mb-7">
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                Bộ lọc
              </h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                Xóa tất cả
              </button>
            </div>

            <FilterSection title="Từ khóa">
              <input
                type="text"
                className="form-input"
                value={draft.q}
                onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Tên giày, mẫu..."
              />
            </FilterSection>

            <FilterSection title="Danh mục">
              <select
                className="form-input"
                value={draft.category}
                onChange={(e) => applyFilters({ category: e.target.value })}
              >
                <option value="">Tất cả</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FilterSection>

            <FilterSection title="Khoảng giá (₫)">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="form-input"
                  value={draft.priceMin}
                  onChange={(e) => setDraft((d) => ({ ...d, priceMin: e.target.value }))}
                  placeholder="Từ"
                />
                <input
                  type="number"
                  className="form-input"
                  value={draft.priceMax}
                  onChange={(e) => setDraft((d) => ({ ...d, priceMax: e.target.value }))}
                  placeholder="Đến"
                />
              </div>
            </FilterSection>

            <FilterSection title="Bộ lọc khác">
              <div className="flex flex-col gap-3">
                <FilterCheckbox
                  label="Còn hàng"
                  checked={draft.inStock}
                  onChange={(v) => applyFilters({ inStock: v })}
                />
                <FilterCheckbox
                  label="Hàng mới"
                  checked={draft.isNew}
                  onChange={(v) => applyFilters({ isNew: v })}
                />
                <FilterCheckbox
                  label="Bán chạy"
                  checked={draft.isHot}
                  onChange={(v) => applyFilters({ isHot: v })}
                />
                <FilterCheckbox
                  label="Khuyến mãi"
                  checked={draft.isPromotion}
                  onChange={(v) => applyFilters({ isPromotion: v })}
                />
                <FilterCheckbox
                  label="Nổi bật"
                  checked={draft.isFeatured}
                  onChange={(v) => applyFilters({ isFeatured: v })}
                />
              </div>
            </FilterSection>

            <FilterSection title="Sắp xếp">
              <select
                className="form-input"
                value={draft.sort}
                onChange={(e) => applyFilters({ sort: e.target.value })}
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="createdAt">Cũ nhất</option>
                <option value="price">Giá thấp → cao</option>
                <option value="-price">Giá cao → thấp</option>
                <option value="-sold">Bán chạy nhất</option>
                <option value="-rating">Đánh giá cao</option>
              </select>
            </FilterSection>

            <button type="button" onClick={() => applyFilters()} className="btn-primary w-full py-3">
              Áp dụng bộ lọc
            </button>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid-products">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold mb-2" style={{ color: 'var(--ink-2)' }}>
                Không tìm thấy sản phẩm
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-3)' }}>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button type="button" onClick={handleReset} className="btn-primary">
                Xóa bộ lọc
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mt-12">
              <button
                type="button"
                className="btn-ghost px-5 py-2"
                disabled={filters.page === 1}
                onClick={() => applyFilters({ page: filters.page - 1 }, false)}
              >
                ← Trước
              </button>
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => applyFilters({ page: n }, false)}
                  className="w-10 h-10 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: n === filters.page ? 'var(--accent)' : '#fff',
                    color: n === filters.page ? '#fff' : 'var(--ink-2)',
                    border: `1px solid ${n === filters.page ? 'var(--accent)' : 'var(--sand-2)'}`,
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="btn-ghost px-5 py-2"
                disabled={filters.page >= totalPages}
                onClick={() => applyFilters({ page: filters.page + 1 }, false)}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
