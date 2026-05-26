const express = require('express');
const { 
  getProducts, 
  getProduct,
  getFeaturedProducts,
  getNewProducts,
  getHotProducts,
  getCategories,
  getTopSelling,
  getMostViewed,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { uploadProductImages } = require('../controllers/uploadController');
const { uploadProductImages: uploadMiddleware } = require('../middleware/upload.middleware');
const auth = require('../middleware/auth.middleware');
const router = express.Router();

const checkRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ EC: 1, EM: 'Bạn không có quyền truy cập chức năng này' });
  }
  next();
};

// Admin/Staff routes
router.post('/admin', auth, checkRoles(['Staff', 'Admin']), createProduct);
router.put('/admin/:id', auth, checkRoles(['Staff', 'Admin']), updateProduct);
router.delete('/admin/:id', auth, checkRoles(['Staff', 'Admin']), deleteProduct);

// Public routes
router.post('/upload', uploadMiddleware, uploadProductImages);
router.get('/featured', getFeaturedProducts);
router.get('/new', getNewProducts);
router.get('/hot', getHotProducts);
router.get('/categories', getCategories);
router.get('/top-selling', getTopSelling);
router.get('/most-viewed', getMostViewed);
router.get('/', getProducts);
router.get('/:slug', getProduct);

module.exports = router;
