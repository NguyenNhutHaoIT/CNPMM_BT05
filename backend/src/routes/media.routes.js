const express = require('express');
const {
  getProductImage,
  getProductAvatar,
  getUserAvatar,
} = require('../controllers/mediaController');

const router = express.Router();

router.get('/products/:id/avatar', getProductAvatar);
router.get('/products/:id/images/:index', getProductImage);
router.get('/users/:id/avatar', getUserAvatar);

module.exports = router;
