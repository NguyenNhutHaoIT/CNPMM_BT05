import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PROMO = '🚚 Miễn phí vận chuyển đơn giày từ 299K · ✨ Giảm đến 40% BST sneaker mùa hè';

export default function TopBar() {
  const { auth } = useContext(AuthContext);

  // Hide TopBar for Staff and Admin
  if (auth.isAuthenticated && auth.user?.role !== 'Customer') {
    return null;
  }

  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <p className="top-bar-promo-mobile m-0 flex-1 text-center md:text-left">{PROMO}</p>
        <div className="top-bar-actions">
          <a href="tel:19001234" className="top-bar-link">
            1900 1234
          </a>
          <span className="top-bar-dot" aria-hidden />
          <Link to="/search?isPromotion=true" className="top-bar-link top-bar-link-accent">
            Ưu đãi hôm nay
          </Link>
        </div>
      </div>
    </div>
  );
}
