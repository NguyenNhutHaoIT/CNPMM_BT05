import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';

const PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: 'createdAt', label: 'Cũ nhất' },
  { value: 'price', label: 'Giá thấp → cao' },
  { value: '-price', label: 'Giá cao → thấp' },
  { value: '-sold', label: 'Bán chạy' },
  { value: '-views', label: 'Xem nhiều' },
  { value: '-rating', label: 'Đánh giá cao' },
];

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
  };
}

function buildUrlParams(filters) {
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
  if (filters.sort && filters.sort !== '-createdAt') params.set('sort', filters.sort);
  return params;
}

function buildApiParams(filters, page) {
  const params = buildUrlParams(filters);
  params.set('page', String(page));
  params.set('limit', String(PER_PAGE));
  return params;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [draft, setDraft] = useState(() => readFiltersFromParams(searchParams));

  const sentinelRef = useRef(null);
  const fetchingMoreRef = useRef(false);

  const filters = readFiltersFromParams(searchParams);
  const filterKey = searchParams.toString();
  const hasMore = products.length < total;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label || 'Mới nhất';

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

  const fetchPage = useCallback(
    async (pageNum, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const currentFilters = readFiltersFromParams(searchParams);
        const res = await axios.get(`/products?${buildApiParams(currentFilters, pageNum)}`);
        if (res.EC === 0) {
          const batch = res.DT?.items || [];
          setTotal(res.DT?.total || 0);
          setProducts((prev) => (append ? [...prev, ...batch] : batch));
          setPage(pageNum);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchParams]
  );

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setTotal(0);
    fetchPage(1, false);
  }, [filterKey, fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !fetchingMoreRef.current) {
          fetchingMoreRef.current = true;
          fetchPage(page + 1, true).finally(() => {
            fetchingMoreRef.current = false;
          });
        }
      },
      { rootMargin: '240px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  const applyFilters = (overrides = {}) => {
    const next = { ...readFiltersFromParams(searchParams), ...draft, ...overrides };
    setSearchParams(buildUrlParams(next), { replace: true });
  };

  const applySort = (sort) => {
    applyFilters({ sort });
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setDraft({
      q: '',
      category: '',
      priceMin: '',
      priceMax: '',
      inStock: false,
      isNew: false,
      isHot: false,
      isPromotion: false,
      isFeatured: false,
      sort: '-createdAt',
    });
  };

  const activeFilterCount = [
    filters.q,
    filters.category,
    filters.priceMin,
    filters.priceMax,
    filters.inStock,
    filters.isNew,
    filters.isHot,
    filters.isPromotion,
    filters.isFeatured,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
          {filters.q ? `Kết quả cho "${filters.q}"` : 'Cửa hàng giày dép'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-3)' }}>
          {loading && products.length === 0 ? (
            'Đang tải sản phẩm...'
          ) : (
            <>
              Tìm thấy <strong style={{ color: 'var(--ink)' }}>{total}</strong> sản phẩm
              {products.length > 0 && products.length < total && (
                <>
                  {' '}
                  · Đã hiển thị <strong style={{ color: 'var(--ink)' }}>{products.length}</strong>
                </>
              )}
            </>
          )}
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
                {activeFilterCount > 0 && (
                  <span className="search-filter-badge">{activeFilterCount}</span>
                )}
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

            <button type="button" onClick={() => applyFilters()} className="btn-primary w-full py-3">
              Áp dụng bộ lọc
            </button>
          </div>
        </aside>

        <div>
          <div className="search-toolbar">
            <div className="search-toolbar__meta">
              <span className="search-toolbar__label">Sắp xếp</span>
              <span className="search-toolbar__active">{sortLabel}</span>
            </div>
            <div className="search-toolbar__sort" role="group" aria-label="Sắp xếp sản phẩm">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applySort(opt.value)}
                  className={`search-sort-pill${filters.sort === opt.value ? ' search-sort-pill--active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid-products">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div ref={sentinelRef} className="h-2" aria-hidden />
              {loadingMore && (
                <div className="search-load-more">
                  <div className="spinner" />
                  <span>Đang tải thêm sản phẩm...</span>
                </div>
              )}
              {!hasMore && (
                <p className="search-end-message">
                  Đã hiển thị tất cả {total} sản phẩm
                </p>
              )}
            </>
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
        </div>
      </div>
    </div>
  );
}
