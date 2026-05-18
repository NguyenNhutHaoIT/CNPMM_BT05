import React, { useState } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductSwiper({ images = [], title = '' }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const list = images
    .filter((img) => img?.url)
    .map((img) => ({ ...img, url: resolveImageUrl(img.url) }));
  const hasMany = list.length > 1;

  if (!list.length) {
    return (
      <div
        className="aspect-square rounded-3xl flex items-center justify-center text-sm"
        style={{ background: 'var(--sand)', color: 'var(--ink-3)', border: '1px solid var(--sand-2)' }}
      >
        Chưa có hình ảnh
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div
        className="rounded-3xl overflow-hidden mb-3 relative"
        style={{ background: 'var(--sand)', border: '1px solid var(--sand-2)' }}
      >
        {hasMany && (
          <span
            className="absolute top-4 right-4 z-10 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(42,35,32,0.75)', color: '#fff' }}
          >
            {activeIndex + 1} / {list.length}
          </span>
        )}

        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          navigation={hasMany}
          pagination={hasMany ? { clickable: true } : false}
          loop={hasMany}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onSlideChange={(sw) => setActiveIndex(sw.realIndex)}
          className="aspect-square product-main-swiper"
        >
          {list.map((img, idx) => (
            <SwiperSlide key={`${img.url}-${idx}`}>
              <img
                src={img.url}
                alt={img.alt || title || `Ảnh ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {hasMany && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={Math.min(list.length, 5)}
          watchSlidesProgress
          modules={[Thumbs]}
          className="thumbnail-swiper"
        >
          {list.map((img, idx) => (
            <SwiperSlide key={`thumb-${img.url}-${idx}`}>
              <div
                className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                style={{ border: '2px solid transparent' }}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <style>{`
        .product-main-swiper .swiper-button-next,
        .product-main-swiper .swiper-button-prev {
          width: 40px;
          height: 40px;
          background: #fff;
          border-radius: 50%;
          border: 1px solid var(--sand-2);
          color: var(--ink-2);
          box-shadow: 0 2px 8px rgba(26,18,9,0.12);
        }
        .product-main-swiper .swiper-button-next:after,
        .product-main-swiper .swiper-button-prev:after {
          font-size: 14px;
          font-weight: bold;
        }
        .swiper-slide-thumb-active > div {
          border-color: var(--accent) !important;
        }
        .swiper-pagination-bullet {
          background: var(--sand-3);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: var(--accent);
        }
      `}</style>
    </div>
  );
}
