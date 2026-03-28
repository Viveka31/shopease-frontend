import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [] }); setTotalPrice(0); setTotalItems(0); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
      setTotalPrice(data.totalPrice);
      setTotalItems(data.totalItems);
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, size = '', color = '') => {
    const { data } = await api.post('/cart', { productId, quantity, size, color });
    setCart(data.cart);
    setTotalPrice(data.totalPrice);
    setTotalItems(data.cart.items.reduce((a, i) => a + i.quantity, 0));
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    setCart(data.cart);
    setTotalPrice(data.totalPrice);
    setTotalItems(data.cart.items.reduce((a, i) => a + i.quantity, 0));
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    setCart(data.cart);
    setTotalPrice(data.totalPrice);
    setTotalItems(data.cart.items.reduce((a, i) => a + i.quantity, 0));
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [] });
    setTotalPrice(0);
    setTotalItems(0);
  };

  return (
    <CartContext.Provider value={{ cart, totalPrice, totalItems, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
