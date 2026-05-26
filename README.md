

Một dự án bán hàng trực tuyến hoàn chỉnh xây dựng với **Node.js + Express + MongoDB** (Backend) và **React + Vite + Tailwind CSS** (Frontend).

## ✨ Tính năng chính

### 🏠 Trang chủ
- ✅ Hiển thị sản phẩm nổi bật, mới nhất, bán chạy nhất
- ✅ Banner khuyến mãi đặc biệt
- ✅ Chào mừng thành viên đã đăng nhập
- ✅ Thông tin thành viên đăng nhập

### 🔐 Xác thực người dùng
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/mật khẩu
- ✅ Quên mật khẩu (reset qua email)
- ✅ Quản lý hồ sơ cá nhân
- ✅ Đổi mật khẩu

### 📦 Sản phẩm
- ✅ Hiển thị chi tiết sản phẩm với hình ảnh (Swiper)
- ✅ Báo hàng tồn kho
- ✅ Hiển thị số lượng bán được
- ✅ Tăng/giảm số lượng sản phẩm
- ✅ Sản phẩm tương tự từ danh mục
- ✅ Đánh giá sao và số lượng bình luận
- ✅ Khuyến mãi và giảm giá hiển thị rõ ràng

### 🔍 Tìm kiếm & Lọc
- ✅ Tìm kiếm theo từ khóa (full-text search)
- ✅ Lọc theo danh mục
- ✅ Lọc theo khoảng giá (min/max)
- ✅ Lọc hàng còn/hết
- ✅ Lọc hàng mới, bán chạy, khuyến mãi, nổi bật
- ✅ Sắp xếp (mới nhất, cũ nhất, giá thấp/cao, đánh giá)
- ✅ Phân trang

### 🎨 Giao diện
- ✅ Sử dụng Tailwind CSS
- ✅ Responsive design
- ✅ Dark mode ready
- ✅ Swiper cho hình ảnh sản phẩm

## 📋 Yêu cầu hệ thống

- **Node.js** >= 14
- **MongoDB** >= 4.4
- **npm** hoặc **yarn**

## 🚀 Cách chạy dự án

### 1. Setup Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường
# Tạo file .env nếu chưa có, sao chép từ mẫu:
# NODE_ENV=development
# PORT=8080
# MONGO_DB_URL=mongodb://localhost:27017/fullstack_db
# JWT_SECRET=your_jwt_secret_here
# JWT_EXPIRE=7d
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_pass
# FRONTEND_URL=http://localhost:5173

# Chạy seed data để tạo sản phẩm mẫu
node src/seed/seed.js

# Chạy server
npm run dev
# Server sẽ chạy trên: http://localhost:8080
```

### 2. Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường
# Tạo file .env:
# VITE_BACKEND_URL=http://localhost:8080

# Chạy development server
npm run dev
# Ứng dụng sẽ chạy trên: http://localhost:5173
```

## 📁 Cấu trúc thư mục

```
FullStack/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình database
│   │   ├── controllers/     # Xử lý logic controller
│   │   ├── middleware/      # Middleware (auth, ...)
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── seed/            # Seed data
│   │   └── server.js        # Entry point
│   ├── .env                 # Biến môi trường
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # React components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── assets/          # Static files
│   │   ├── App.jsx          # App component
│   │   └── main.jsx         # Entry point
│   ├── .env                 # Biến môi trường
│   ├── tailwind.config.js   # Tailwind config
│   ├── vite.config.js       # Vite config
│   └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /v1/api/auth/register` - Đăng ký
- `POST /v1/api/auth/login` - Đăng nhập
- `GET /v1/api/auth/profile` - Lấy hồ sơ (yêu cầu auth)
- `PUT /v1/api/auth/profile` - Cập nhật hồ sơ (yêu cầu auth)
- `POST /v1/api/auth/forgot-password` - Gửi email reset
- `POST /v1/api/auth/reset-password/:token` - Reset mật khẩu

### Products
- `GET /v1/api/products` - Lấy danh sách sản phẩm (hỗ trợ lọc, sắp xếp)
- `GET /v1/api/products/:slug` - Lấy chi tiết sản phẩm
- `GET /v1/api/products/featured` - Lấy sản phẩm nổi bật
- `GET /v1/api/products/new` - Lấy sản phẩm mới
- `GET /v1/api/products/hot` - Lấy sản phẩm bán chạy
- `GET /v1/api/products/categories` - Lấy danh sách danh mục

### Query Parameters (cho /products)
- `q` - Tìm kiếm (full-text search)
- `category` - Danh mục
- `priceMin` - Giá tối thiểu
- `priceMax` - Giá tối đa
- `inStock` - Còn hàng (true/false)
- `isNew` - Hàng mới (true/false)
- `isHot` - Bán chạy (true/false)
- `isPromotion` - Khuyến mãi (true/false)
- `isFeatured` - Nổi bật (true/false)
- `sort` - Sắp xếp (-createdAt, createdAt, price, -price, -sold, -rating)
- `page` - Trang (mặc định 1)
- `limit` - Số lượng trên mỗi trang (mặc định 12)

## 🎯 Luồng sử dụng

1. **Khách vô đăng ký/đăng nhập** → Nếu chưa có tài khoản, đăng ký trước
2. **Xem trang chủ** → Hiển thị sản phẩm nổi bật, bán chạy, mới nhất
3. **Tìm kiếm sản phẩm** → Sử dụng tìm kiếm hoặc bộ lọc nâng cao
4. **Xem chi tiết sản phẩm** → Xem hình ảnh (Swiper), thông tin, sản phẩm tương tự
5. **Quản lý hồ sơ** → Cập nhật thông tin cá nhân, đổi mật khẩu

## 🎨 Công nghệ sử dụng

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (Authentication)
- bcrypt (Password hashing)
- Nodemailer (Email)

### Frontend
- React 18
- React Router v6
- Vite
- Tailwind CSS
- Axios
- Swiper (Image slider)

## 📝 Ghi chú

- Dữ liệu sản phẩm được tạo tự động qua `seed.js`
- JWT token được lưu trong `localStorage`
- Các request cần auth phải gửi token trong header `Authorization: Bearer <token>`
- Mật khẩu được hash bằng bcrypt trước khi lưu

## 🐛 Troubleshooting

### MongoDB không kết nối
```bash
# Kiểm tra MongoDB service đang chạy
# Windows: Services > MongoDB Server
# Mac: brew services list
# Linux: sudo systemctl status mongod
```

### CORS Error
- Kiểm tra backend có cấu hình CORS đúng
- Kiểm tra VITE_BACKEND_URL trong file .env frontend

### Port đã được sử dụng
```bash
# Thay đổi PORT trong .env (backend)
# Thay đổi port trong vite.config.js (frontend)
```

## 📞 Liên hệ & Hỗ trợ

Nếu có bất kỳ vấn đề nào, vui lòng tạo issue hoặc liên hệ trực tiếp.

---

**Happy Coding! 🚀**
