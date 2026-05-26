import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!auth.isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get('/cart');
      if (res?.EC === 0) {
        setCart(res.DT);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [auth.isAuthenticated]);

  const addToCart = async (productId, size, color, quantity = 1) => {
    if (!auth.isAuthenticated) {
      throw new Error('UNAUTHORIZED');
    }
    try {
      const res = await axios.post('/cart', { productId, size, color, quantity });
      if (res?.EC === 0) {
        setCart(res.DT);
        return res;
      } else {
        throw new Error(res?.EM || 'Lỗi thêm vào giỏ hàng');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  const updateCartItem = async (productId, size, color, quantity) => {
    try {
      const res = await axios.put('/cart', { productId, size, color, quantity });
      if (res?.EC === 0) {
        setCart(res.DT);
        return res;
      } else {
        throw new Error(res?.EM || 'Lỗi cập nhật giỏ hàng');
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      throw err;
    }
  };

  const removeFromCart = async (productId, size, color) => {
    try {
      const res = await axios.delete('/cart', { data: { productId, size, color } });
      if (res?.EC === 0) {
        setCart(res.DT);
        return res;
      } else {
        throw new Error(res?.EM || 'Lỗi xóa khỏi giỏ hàng');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete('/cart/clear');
      if (res?.EC === 0) {
        setCart(res.DT);
        return res;
      } else {
        throw new Error(res?.EM || 'Lỗi làm sạch giỏ hàng');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  };

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateCartItem, removeFromCart, clearCart, cartItemsCount }}>
      {children}
    </CartContext.Provider>
  );
};
