const Cart = require('../models/cart');
const Product = require('../models/product');
const { productAvatar } = require('../utils/userResponse'); // wait, let's verify where productAvatar or image urls are generated.

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    return res.status(200).json({
      EC: 0,
      DT: cart,
      EM: 'Lấy giỏ hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, color, quantity } = req.body;
    
    if (!productId || !size || !color) {
      return res.status(200).json({ EC: 1, EM: 'Thiếu thông tin sản phẩm (ID, size, màu)' });
    }
    
    const qty = parseInt(quantity) || 1;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(200).json({ EC: 1, EM: 'Sản phẩm không tồn tại' });
    }
    
    if (product.stock < qty) {
      return res.status(200).json({ EC: 1, EM: `Sản phẩm này chỉ còn ${product.stock} sản phẩm trong kho` });
    }
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    const itemIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );
    
    if (itemIdx > -1) {
      // Check total stock limit
      const newQty = cart.items[itemIdx].quantity + qty;
      if (product.stock < newQty) {
        return res.status(200).json({ EC: 1, EM: `Không thể thêm. Tổng số lượng trong giỏ (${newQty}) vượt quá tồn kho (${product.stock})` });
      }
      cart.items[itemIdx].quantity = newQty;
    } else {
      cart.items.push({ product: productId, size, color, quantity: qty });
    }
    
    await cart.save();
    
    // Populate before return
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    
    return res.status(200).json({
      EC: 0,
      DT: updatedCart,
      EM: 'Đã thêm sản phẩm vào giỏ hàng'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, color, quantity } = req.body;
    
    if (!productId || !size || !color) {
      return res.status(200).json({ EC: 1, EM: 'Thiếu thông tin cập nhật' });
    }
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(200).json({ EC: 1, EM: 'Số lượng phải lớn hơn hoặc bằng 1' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(200).json({ EC: 1, EM: 'Sản phẩm không tồn tại' });
    }
    
    if (product.stock < qty) {
      return res.status(200).json({ EC: 1, EM: `Chỉ còn ${product.stock} sản phẩm trong kho` });
    }
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(200).json({ EC: 1, EM: 'Giỏ hàng trống' });
    }
    
    const itemIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );
    
    if (itemIdx === -1) {
      return res.status(200).json({ EC: 1, EM: 'Không tìm thấy sản phẩm này trong giỏ hàng' });
    }
    
    cart.items[itemIdx].quantity = qty;
    await cart.save();
    
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    
    return res.status(200).json({
      EC: 0,
      DT: updatedCart,
      EM: 'Cập nhật số lượng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, color } = req.body;
    
    if (!productId || !size || !color) {
      return res.status(200).json({ EC: 1, EM: 'Thiếu thông tin để xóa sản phẩm' });
    }
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(200).json({ EC: 1, EM: 'Giỏ hàng trống' });
    }
    
    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size && item.color === color)
    );
    
    await cart.save();
    
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    
    return res.status(200).json({
      EC: 0,
      DT: updatedCart,
      EM: 'Đã xóa sản phẩm khỏi giỏ hàng'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    return res.status(200).json({
      EC: 0,
      DT: cart,
      EM: 'Làm sạch giỏ hàng thành công'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
