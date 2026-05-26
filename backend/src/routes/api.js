const express = require('express');
const productRoutes = require('./product.routes');
const authRoutes = require('./auth.routes');
const mediaRoutes = require('./media.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const router = express.Router();

router.use('/media', mediaRoutes);
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
