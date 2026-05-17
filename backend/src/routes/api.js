const express = require('express');
const productRoutes = require('./product.routes');
const authRoutes = require('./auth.routes');
const router = express.Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);

module.exports = router;
