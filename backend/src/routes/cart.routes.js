const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', auth, getCart);
router.post('/', auth, addToCart);
router.put('/', auth, updateCartItem);
router.delete('/', auth, removeFromCart);
router.delete('/clear', auth, clearCart);

module.exports = router;
