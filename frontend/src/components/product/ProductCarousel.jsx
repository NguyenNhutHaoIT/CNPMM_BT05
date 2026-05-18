import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import axios from '../../api/axios';
import ProductCard from '../ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductCarousel({
  apiPath,
  limit = 10,
  showViews = false,
  slidesPerView = { 320: 1.4, 640: 2.2, 1024: 3.2, 1280: 4 },
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiPath}?limit=${limit}&page=1`);
        if (!cancelled && res.EC === 0) {
          setProducts(res.DT?.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [apiPath, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="product-carousel">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true, dynamicBullets: true }}
        spaceBetween={20}
        slidesPerView={slidesPerView[320] || 1.4}
        breakpoints={{
          640: { slidesPerView: slidesPerView[640] || 2.2, slidesPerGroup: 2 },
          1024: { slidesPerView: slidesPerView[1024] || 3.2, slidesPerGroup: 3 },
          1280: { slidesPerView: slidesPerView[1280] || 4, slidesPerGroup: 4 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id} className="h-auto">
            <ProductCard product={product} showViews={showViews} compact />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
