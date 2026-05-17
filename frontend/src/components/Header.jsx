import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function SearchIcon() {
  return (
    <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

function HeaderSearch({ value, onChange, onSubmit, className = '' }) {
  return (
    <div className={`header-search ${className}`}>
      <form className="header-search-form" onSubmit={onSubmit}>
        <SearchIcon />
        <input
          type="search"
          className="header-search-input"
          placeholder="Tìm sneaker, sandal, boots..."
          value={value}
          onChange={onChange}
          aria-label="Tìm kiếm sản phẩm"
        />
        <button type="submit" className="header-search-btn">
          Tìm
        </button>
      </form>
    </div>
  );
}

const NAV = [
  { to: '/', label: 'Trang chủ', exact: true },
  { to: '/search', label: 'Cửa hàng', exact: true },
  { to: '/search?isNew=true', label: 'Hàng mới' },
  { to: '/search?isPromotion=true', label: 'Sale' },
];

export default function Header() {
  const { auth, setAuth } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuth({ isAuthenticated: false, user: null });
    setUserMenuOpen(false);
    nav('/');
  };

  const goSearch = (query) => {
    const q = query.trim();
    if (!q) return;
    nav(`/search?q=${encodeURIComponent(q)}`);
    setSearchVal('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goSearch(searchVal);
  };

  const isNavActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    const [path, query] = item.to.split('?');
    return location.pathname === path && location.search.includes(query);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-row">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 transition-opacity">
            <div
              className="flex items-center justify-center rounded-lg text-white text-base"
              style={{ width: 36, height: 36, background: 'var(--accent)' }}
            >
              ◆
            </div>
            <div className="hidden sm:block">
              <div className="font-serif text-lg font-bold leading-none" style={{ color: 'var(--ink)' }}>
                LUXE
              </div>
              <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--ink-3)' }}>
                Shoes
              </div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5 flex-shrink-0">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`header-nav-link ${isNavActive(item) ? 'header-nav-link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <HeaderSearch
            className="hidden md:flex"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onSubmit={handleSearchSubmit}
          />

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {auth.isAuthenticated ? (
              <div ref={menuRef} className="flex items-center gap-2 relative">
                <div className="hidden lg:block text-right">
                  <div className="text-[11px]" style={{ color: 'var(--ink-3)' }}>Xin chào</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    {auth.user?.name?.split(' ').slice(-1)[0] || 'Bạn'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--accent-light)',
                    border: '1.5px solid var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  {auth.user?.name?.[0]?.toUpperCase() || 'U'}
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-11 bg-white rounded-xl shadow-lg py-1.5 w-40 z-50"
                    style={{ border: '1px solid var(--sand-2)' }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-[var(--sand)]"
                      style={{ color: 'var(--ink-2)' }}
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50"
                      style={{ color: '#a63d3d' }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex text-[13px] py-2 px-4">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary text-[13px] py-2 px-4">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        <HeaderSearch
          className="md:hidden pb-3"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onSubmit={handleSearchSubmit}
        />
      </div>
    </header>
  );
}
