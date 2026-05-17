import React from 'react';
import { Link } from 'react-router-dom';

const COLS = [
  {
    title: 'Về chúng tôi',
    links: ['Giới thiệu', 'Tin tức', 'Tuyển dụng', 'Liên hệ'],
  },
  {
    title: 'Chính sách',
    links: ['Điều khoản dịch vụ', 'Chính sách bảo mật', 'Chính sách hoàn tiền', 'Vận chuyển'],
  },
  {
    title: 'Hỗ trợ',
    links: ['FAQ', 'Chat tư vấn', 'Hotline 24/7', 'Tra cứu đơn hàng'],
  },
];

const CONTACTS = [
  { icon: '📞', label: 'HOTLINE', value: '1900 1234' },
  { icon: '✉️', label: 'EMAIL', value: 'support@luxe.vn' },
  { icon: '📍', label: 'ĐỊA CHỈ', value: 'TP. Hồ Chí Minh' },
  { icon: '🕐', label: 'GIỜ LÀM VIỆC', value: '8:00 – 22:00 hàng ngày' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5 hover:opacity-90 transition-opacity">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: 40, height: 40, background: 'var(--accent)' }}
              >
                <span className="text-white text-base">◆</span>
              </div>
              <span className="font-serif text-xl font-bold text-white">LUXE</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ maxWidth: 280 }}>
              Cửa hàng giày dép cao cấp — sneaker, sandal, boots và giày công sở chính hãng.
            </p>
            <div className="flex gap-4 mt-6 text-2xl">
              {['📘', '📸', '𝕏'].map((icon, i) => (
                <a key={i} href="#" className="transition-colors hover:opacity-100 opacity-70">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title} className="site-footer-links">
              <h4 className="text-white text-sm font-semibold mb-5" style={{ letterSpacing: 0.5 }}>
                {col.title}
              </h4>
              <ul className="space-y-3 list-none m-0 p-0">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-contact">
          {CONTACTS.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div
                  className="text-xs mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}
                >
                  {item.label}
                </div>
                <div className="text-white font-semibold">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="site-footer-bottom">
          <p className="m-0">© 2026 LUXE Shoes Store. All rights reserved.</p>
          <p className="m-0">
            Thiết kế bởi <span className="text-white font-medium">LUXE Team</span> · Made with ❤️ tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
