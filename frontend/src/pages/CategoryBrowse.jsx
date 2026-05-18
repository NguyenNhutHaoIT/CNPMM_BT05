import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';

const PER_PAGE = 12;

const CATEGORY_ICONS = {
  Sneaker: '👟',
  'Thể thao': '🏃',
  Casual: '👞',
  Boots: '🥾',
  Sandal: '🩴',
  'Công sở': '👔',
};

export default function CategoryBrowse() {
  const { category: categoryParam } = useParams();
  const category = decodeURIComponent(categoryParam || '');
  const nav = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const sentinelRef = useRef(null);
  const fetchingMoreRef = useRef(false);

  const hasMore = products.length < total;

  const fetchPage = useCallback(
    async (pageNum, append = false) => {
      if (!category) return;
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const params = new URLSearchParams({
          category,
          page: String(pageNum),
          limit: String(PER_PAGE),
          sort: '-createdAt',
        });
        const res = await axios.get(`/products?${params}`);
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
    [category]
  );

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setTotal(0);
    fetchPage(1, false);
  }, [fetchPage]);

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
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  const catList = categories.length ? categories : Object.keys(CATEGORY_ICONS);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="text-sm mb-6" style={{ color: 'var(--ink-3)' }}>
        <Link to="/" className="hover:text-[var(--accent)]">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span style={{ color: 'var(--ink)' }}>{category || 'Danh mục'}</span>
      </nav>

      <div className="mb-8">
        <div
          className="text-xs font-bold uppercase mb-2"
          style={{ color: 'var(--accent)', letterSpacing: 3 }}
        >
          DANH MỤC
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
          <span className="mr-2">{CATEGORY_ICONS[category] || '👟'}</span>
          {category}
        </h1>
        <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
          {loading ? (
            'Đang tải...'
          ) : (
            <>
              <strong style={{ color: 'var(--ink)' }}>{total}</strong> sản phẩm · Cuộn xuống để tải
              thêm
            </>
          )}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-6 mb-8">
        {catList.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => nav(`/category/${encodeURIComponent(cat)}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-all border"
            style={{
              background: cat === category ? 'var(--accent)' : '#fff',
              color: cat === category ? '#fff' : 'var(--ink-2)',
              borderColor: cat === category ? 'var(--accent)' : 'var(--sand-2)',
            }}
          >
            <span>{CATEGORY_ICONS[cat] || '👟'}</span>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
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
          <div ref={sentinelRef} className="h-4" aria-hidden />
          {loadingMore && (
            <div className="flex justify-center py-10">
              <div className="spinner" />
            </div>
          )}
          {!hasMore && products.length > 0 && (
            <p className="text-center text-sm py-8" style={{ color: 'var(--ink-3)' }}>
              Đã hiển thị tất cả sản phẩm trong danh mục
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👟</div>
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--ink-2)' }}>
            Chưa có sản phẩm trong danh mục này
          </p>
          <Link to="/search" className="btn-primary inline-block mt-4">
            Xem tất cả sản phẩm
          </Link>
        </div>
      )}
    </div>
  );
}
