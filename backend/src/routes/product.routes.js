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
} = require('../controllers/productController');
const { uploadProductImages } = require('../controllers/uploadController');
const { uploadProductImages: uploadMiddleware } = require('../middleware/upload.middleware');
const router = express.Router();

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
