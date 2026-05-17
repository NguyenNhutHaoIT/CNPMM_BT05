require('dotenv').config();
const mongoose = require('mongoose');
const connection = require('../config/database');
const Product = require('../models/product');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const img = (url, alt) => ({ url, alt });

const products = [
  {
    title: 'Giày Sneaker Trắng Cổ Cao',
    slug: 'giay-sneaker-trang-co-cao',
    description:
      'Giày sneaker trắng cổ cao với thiết kế hiện đại, đế cao su chống trượt, thoải mái cho cả ngày dài. Phù hợp phối với quần jean, jogger hoặc váy midi.',
    price: 599000,
    originalPrice: 799000,
    discount: 25,
    stock: 50,
    sold: 156,
    category: 'Sneaker',
    images: [
      img('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', 'Giày sneaker trắng - mặt trước'),
      img('https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'Giày sneaker trắng - góc nghiêng'),
      img('https://images.unsplash.com/photo-1595950653102-6c9ebf5b4b7e?w=800&q=80', 'Giày sneaker trắng - chi tiết'),
    ],
    rating: 4.8,
    reviews: 125,
    isFeatured: true,
    isNewArrival: true,
    isHot: true,
    isPromotion: true,
    promotionText: 'Giảm 25% - Hôm nay',
  },
  {
    title: 'Giày Thể Thao Đen',
    slug: 'giay-the-thao-den',
    description:
      'Giày thể thao đen chất lượng cao, đệm êm, hỗ trợ tốt khi chạy bộ và tập gym. Upper thoáng khí, dễ vệ sinh.',
    price: 450000,
    originalPrice: 600000,
    discount: 25,
    stock: 45,
    sold: 203,
    category: 'Thể thao',
    images: [
      img('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'Giày thể thao đỏ đen'),
      img('https://images.unsplash.com/photo-1605348532760-675df11b4c32?w=800&q=80', 'Giày thể thao - đế'),
      img('https://images.unsplash.com/photo-1511556820789-d912d6c4ed7d?w=800&q=80', 'Giày thể thao - phối đồ'),
    ],
    rating: 4.6,
    reviews: 98,
    isFeatured: true,
    isNewArrival: false,
    isHot: true,
    isPromotion: false,
  },
  {
    title: 'Giày Lười Casual Nâu',
    slug: 'giay-luoi-casual-nau',
    description:
      'Giày lười casual màu nâu da PU cao cấp, dễ phối công sở và dạo phố. Form ôm chân, mang không cần buộc dây.',
    price: 350000,
    originalPrice: 450000,
    discount: 22,
    stock: 60,
    sold: 89,
    category: 'Casual',
    images: [
      img('https://images.unsplash.com/photo-1533867617851-d662f5748deb?w=800&q=80', 'Giày lười nâu'),
      img('https://images.unsplash.com/photo-1614252238956-18c8724873f1?w=800&q=80', 'Giày lười - chi tiết'),
    ],
    rating: 4.5,
    reviews: 67,
    isFeatured: false,
    isNewArrival: true,
    isHot: false,
    isPromotion: false,
  },
  {
    title: 'Giày Boots Cao Cấp',
    slug: 'giay-boots-cao-cap',
    description:
      'Giày boots da thật cao cấp, sang trọng và bền lâu. Lót lông ấm, phù hợp mùa lạnh và phong cách streetwear.',
    price: 1200000,
    originalPrice: 1800000,
    discount: 33,
    stock: 25,
    sold: 67,
    category: 'Boots',
    images: [
      img('https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', 'Giày boots đen'),
      img('https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80', 'Giày boots - góc'),
      img('https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 'Giày boots - đế'),
    ],
    rating: 4.9,
    reviews: 89,
    isFeatured: true,
    isNewArrival: false,
    isHot: true,
    isPromotion: false,
  },
  {
    title: 'Giày Sandal Nữ Hè',
    slug: 'giay-sandal-nu-he',
    description:
      'Giày sandal nữ hè nhẹ nhàng, quai mềm, đế chống trượt. Thoáng mát, dễ đi biển và dạo phố.',
    price: 200000,
    originalPrice: 300000,
    discount: 33,
    stock: 80,
    sold: 456,
    category: 'Sandal',
    images: [
      img('https://images.unsplash.com/photo-1603487742131-4160ec999806?w=800&q=80', 'Sandal hè'),
      img('https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'Sandal - phối đồ'),
    ],
    rating: 4.6,
    reviews: 356,
    isFeatured: false,
    isNewArrival: true,
    isHot: true,
    isPromotion: false,
  },
  {
    title: 'Giày Cổ Cao Đỏ',
    slug: 'giay-co-cao-do',
    description:
      'Giày cổ cao đỏ năng động, phong cách streetwear. Đế bệt chắc chắn, phù hợp học sinh sinh viên.',
    price: 550000,
    originalPrice: 750000,
    discount: 27,
    stock: 38,
    sold: 123,
    category: 'Sneaker',
    images: [
      img('https://images.unsplash.com/photo-1525966222131-fdaf967bf329?w=800&q=80', 'Giày cổ cao đỏ'),
      img('https://images.unsplash.com/photo-1460353581641-37baddab0fa6?w=800&q=80', 'Giày cổ cao - chi tiết'),
      img('https://images.unsplash.com/photo-1560769629-851175da9a7d?w=800&q=80', 'Giày cổ cao - bộ sưu tập'),
    ],
    rating: 4.5,
    reviews: 102,
    isFeatured: false,
    isNewArrival: true,
    isHot: true,
    isPromotion: true,
    promotionText: 'Khuyến mãi - Giảm 27%',
  },
  {
    title: 'Giày Chạy Bộ Pro',
    slug: 'giay-chay-bo-pro',
    description:
      'Giày chạy bộ công nghệ đệm React, siêu nhẹ, hỗ trợ gót và mũi chân. Được runner đánh giá cao.',
    price: 890000,
    originalPrice: 1100000,
    discount: 19,
    stock: 32,
    sold: 278,
    category: 'Thể thao',
    images: [
      img('https://images.unsplash.com/photo-1578885117442-32f5a41ed1b0?w=800&q=80', 'Giày chạy bộ'),
      img('https://images.unsplash.com/photo-1600185365926-3a4ce7f7d8b0?w=800&q=80', 'Giày chạy - đế'),
      img('https://images.unsplash.com/photo-1514986888952-8c320ac0cc17?w=800&q=80', 'Giày chạy - side'),
    ],
    rating: 4.7,
    reviews: 201,
    isFeatured: true,
    isNewArrival: false,
    isHot: true,
    isPromotion: true,
    promotionText: 'Runner deal',
  },
  {
    title: 'Giày Da Công Sở Đen',
    slug: 'giay-da-cong-so-den',
    description:
      'Giày da công sở đen bóng, form Oxford cổ điển. Phù hợp sự kiện, phỏng vấn và trang phục vest.',
    price: 750000,
    originalPrice: 950000,
    discount: 21,
    stock: 28,
    sold: 94,
    category: 'Công sở',
    images: [
      img('https://images.unsplash.com/photo-1614252238956-18c8724873f1?w=800&q=80', 'Giày da đen'),
      img('https://images.unsplash.com/photo-1533867617851-d662f5748deb?w=800&q=80', 'Giày da - chi tiết'),
    ],
    rating: 4.8,
    reviews: 76,
    isFeatured: true,
    isNewArrival: false,
    isHot: false,
    isPromotion: true,
    promotionText: 'Office sale',
  },
  {
    title: 'Giày Platform Trắng',
    slug: 'giay-platform-trang',
    description:
      'Giày platform trắng tăng chiều cao nhẹ nhàng, phong cách Y2K. Đế cao 4cm, êm chân cả ngày.',
    price: 420000,
    originalPrice: 520000,
    discount: 19,
    stock: 55,
    sold: 167,
    category: 'Sneaker',
    images: [
      img('https://images.unsplash.com/photo-1595341888016-a392ef81b300?w=800&q=80', 'Giày platform trắng'),
      img('https://images.unsplash.com/photo-1603487742131-4160ec999806?w=800&q=80', 'Giày platform - góc'),
    ],
    rating: 4.4,
    reviews: 88,
    isFeatured: false,
    isNewArrival: true,
    isHot: false,
    isPromotion: false,
  },
  {
    title: 'Giày Slip-on Xám',
    slug: 'giay-slip-on-xam',
    description:
      'Giày slip-on xám tiện lợi, không dây, mang nhanh. Chất liệu canvas bền, đế cao su mềm.',
    price: 280000,
    originalPrice: 350000,
    discount: 20,
    stock: 0,
    sold: 312,
    category: 'Casual',
    images: [
      img('https://images.unsplash.com/photo-1525966222131-fdaf967bf329?w=800&q=80', 'Slip-on xám'),
    ],
    rating: 4.3,
    reviews: 145,
    isFeatured: false,
    isNewArrival: false,
    isHot: true,
    isPromotion: false,
  },
];

const seed = async () => {
  try {
    await connection();

    await Product.deleteMany({});
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('123456', saltRounds);

    await User.create({
      name: 'Nguyễn hao',
      email: 'hao@gmail.com',
      password: hashedPassword,
      role: 'Member',
      points: 2450,
      memberRank: 'Gold',
    });

    console.log('✅ Tài khoản test đã tạo:');
    console.log('   Email: hao@gmail.com');
    console.log('   Password: 123456');
    console.log('   Vai trò: Member');

    await Product.insertMany(products);
    console.log(`✅ Đã tạo ${products.length} sản phẩm giày dép`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seed();
