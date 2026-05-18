# 🛍️ Hướng Dẫn Sử Dụng Ứng Dụng Bán Giày Trực Tuyến

## 📋 Các Tính Năng Đã Xây Dựng

### Backend (Node.js + Express + MongoDB)
✅ **API Upload File (Multer)**
- Upload nhiều ảnh cho sản phẩm (max 10 ảnh, 5MB mỗi ảnh)
- Upload avatar cho user (1 ảnh, 2MB)
- Lưu file vào thư mục `/uploads`
- Trả về URL có thể truy cập từ frontend

✅ **API Sản Phẩm**
- Lấy danh sách sản phẩm với filter (danh mục, giá, hot, mới, khuyến mãi)
- Tìm kiếm theo tên/mô tả
- Lấy chi tiết sản phẩm + sản phẩm tương tự
- Lấy danh mục

✅ **Authentication**
- Đăng ký/Đăng nhập
- JWT token
- Reset mật khẩu qua email
- Hồ sơ thành viên (điểm, hạng)

### Frontend (React + Vite + Tailwind CSS)

✅ **Trang Chủ (Home)**
- Hero banner với tự động chuyển slide
- Thông tin thành viên đăng nhập (name, email, điểm, hạng)
- Nút đăng xuất
- Hiển thị các danh mục
- 4 section sản phẩm: Sale, Hot, New, Featured

✅ **Trang Chi Tiết Sản Phẩm (Product Detail)**
- Gallery Swiper (xem nhiều ảnh, thumbnail navigation)
- Thông tin sản phẩm (giá, khuyến mãi, tồn kho, đã bán)
- Báo trạng thái hàng (còn hàng/sắp hết/hết)
- Chọn số lượng (stepper)
- Thêm vào giỏ hàng
- Sản phẩm tương tự cùng danh mục
- Breadcrumb navigation

✅ **Trang Tìm Kiếm & Lọc (Search)**
- Tìm kiếm theo từ khóa
- Lọc theo danh mục
- Lọc theo khoảng giá
- Lọc theo trạng thái (còn hàng)
- Lọc theo loại sản phẩm (mới, hot, sale, featured)
- Sắp xếp (mới nhất, bán chạy, giá cao/thấp)
- Pagination
- Hiển thị tổng số sản phẩm tìm được

✅ **Components**
- ProductCard: hiển thị sản phẩm với tags, giá, rating
- ProductSwiper: gallery với swiper
- QuantityStepper: chọn số lượng
- StockStatus: báo trạng thái hàng
- Header: navigation, search, user menu
- TopBar: promo message
- Footer: info

---

## 🚀 Hướng Dẫn Chạy

### 1️⃣ Chuẩn Bị Môi Trường

Yêu cầu:
- Node.js v16+ 
- MongoDB (chạy local hoặc cloud)

### 2️⃣ Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (đã có template)
# Kiểm tra: MONGO_DB_URL, JWT_SECRET, SMTP config

# Chạy seed data để tạo dữ liệu test
node src/seed/seed.js

# Chạy dev server
npm run dev
# Backend sẽ chạy tại http://localhost:8080
```

### 3️⃣ Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Kiểm tra .env: VITE_BACKEND_URL=http://localhost:8080

# Chạy dev server
npm run dev
# Frontend sẽ chạy tại http://localhost:5173
```

---

## 👤 Tài Khoản Test

Sau khi chạy seed data:

**Email:** `hao@gmail.com`  
**Password:** `123456`  
**Role:** `Member`  
**Điểm:** `2450`  
**Hạng:** `Gold`

---

## 🔗 API Endpoints

### Sản Phẩm
```
GET  /v1/api/products                 - Danh sách (với filter)
GET  /v1/api/products/:slug          - Chi tiết sản phẩm
GET  /v1/api/products/featured       - Sản phẩm nổi bật
GET  /v1/api/products/new            - Hàng mới
GET  /v1/api/products/hot            - Bán chạy
GET  /v1/api/products/categories     - Danh mục
POST /v1/api/products/upload         - Upload ảnh sản phẩm (multipart/form-data)
```

### Authentication
```
POST /v1/api/auth/register           - Đăng ký
POST /v1/api/auth/login              - Đăng nhập
GET  /v1/api/auth/profile            - Hồ sơ (require token)
PUT  /v1/api/auth/profile            - Cập nhật hồ sơ (require token)
POST /v1/api/auth/upload-avatar      - Upload avatar (require token, multipart/form-data)
POST /v1/api/auth/forgot-password    - Quên mật khẩu
POST /v1/api/auth/reset-password/:token - Đặt lại mật khẩu
```

---

## 📁 Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── server.js
│   ├── config/         - Database config
│   ├── controllers/    - API handlers
│   ├── middleware/     - Auth, upload middleware
│   ├── models/         - MongoDB schemas
│   ├── routes/         - API routes
│   ├── services/       - Business logic
│   ├── utils/          - Helper functions
│   └── seed/           - Seed data script
└── uploads/            - Uploaded files
    ├── products/       - Product images
    └── avatars/        - User avatars

frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx         - Main component
│   ├── api/            - Axios config
│   ├── components/     - Reusable components
│   ├── context/        - React context (Auth)
│   ├── pages/          - Page components
│   ├── utils/          - Helper functions
│   ├── index.css       - Tailwind + custom styles
│   └── App.css         - Component styles
└── .env                - Environment variables
```

---

## 🎯 Các Query Parameter Hỗ Trợ

### Search & Filter:
- `q` - Tìm kiếm theo từ khóa
- `category` - Lọc theo danh mục
- `priceMin` / `priceMax` - Khoảng giá
- `inStock` - Chỉ hiển thị còn hàng (true/false)
- `isNew` - Hàng mới (true/false)
- `isHot` - Bán chạy (true/false)
- `isPromotion` - Đang khuyến mãi (true/false)
- `isFeatured` - Sản phẩm nổi bật (true/false)
- `sort` - Sắp xếp: `-createdAt`, `-sold`, `price`, `-price`
- `page` - Trang (default: 1)
- `limit` - Số sản phẩm/trang (default: 12)

### Ví dụ:
```
GET /products?category=Sneaker&priceMin=100000&priceMax=500000&isPromotion=true&sort=-sold
```

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Multer** - File upload
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Swiper** - Image carousel
- **Axios** - HTTP client
- **React Router** - Navigation

---

## 💡 Tips Phát Triển

### Thêm sản phẩm mới
```javascript
POST /products/upload
Content-Type: multipart/form-data

title: "Tên sản phẩm"
slug: "slug-san-pham"
description: "Mô tả"
price: 500000
originalPrice: 750000
discount: 33
stock: 50
category: "Sneaker"
images: [file1.jpg, file2.jpg, ...]
```

### Upload avatar user
```javascript
POST /auth/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

avatar: file.jpg
```

---

## 🐛 Troubleshooting

**Backend không kết nối MongoDB:**
- Kiểm tra MongoDB service có chạy không
- Kiểm tra `MONGO_DB_URL` trong `.env`

**Frontend không load ảnh:**
- Kiểm tra `VITE_BACKEND_URL` trong `.env`
- Kiểm tra CORS config trong backend

**Upload ảnh fail:**
- Kiểm tra thư mục `/uploads` có quyền write
- Kiểm tra kích thước file không vượt limit
- Kiểm tra MIME type là ảnh

**Login không hoạt động:**
- Kiểm tra token được lưu vào localStorage
- Kiểm tra JWT_SECRET trong backend .env

---

## 📝 Ghi Chú

- Tất cả endpoint (trừ auth cơ bản) đều hỗ trợ filter bằng query parameters
- Avatar user chỉ có 1, product có thể có nhiều ảnh
- Local storage dùng cho cart items và token
- Seed data tạo 10 sản phẩm giày dép test

---

**Phiên bản:** 1.0.0  
**Cập nhật:** May 2026
