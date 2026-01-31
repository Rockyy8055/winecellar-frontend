import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../Services/auth-api';
import { createOrder } from '../Services/orders-api';
import { clearRemoteCart, deleteAllFromCart } from '../store/slices/cart-slice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(new URL('/api/auth/me', API_BASE).toString(), { 
        credentials: 'include' 
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (_) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(new URL('/api/auth/login', API_BASE).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || 'Login failed');
      }

      const userData = await res.json();
      setUser(userData);
      setIsAuthenticated(true);
      
      showNotification('Login successful!', 'success');
      
      // If there's a pending order, place it automatically
      if (pendingOrder) {
        try {
          await placePendingOrder();
        } catch (error) {
          showNotification('Login successful but order placement failed: ' + error.message, 'error');
        }
      }
      
      return true;
    } catch (error) {
      showNotification(error.message, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      try {
        await dispatch(clearRemoteCart()).unwrap();
      } catch (_) {
        dispatch(deleteAllFromCart());
      }
      await fetch(new URL('/api/auth/logout', API_BASE).toString(), { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (_) {}
    
    setUser(null);
    setIsAuthenticated(false);
    setPendingOrder(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    try { localStorage.removeItem('cartProducts'); } catch (_) {}
    dispatch(deleteAllFromCart());
    showNotification('Logged out successfully', 'info');
    navigate('/');
  };

  const requireAuth = (orderData = null) => {
    if (!isAuthenticated) {
      if (orderData) {
        setPendingOrder(orderData);
      }
      showNotification('Please login to place an order', 'warning');
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Login required to place order',
          orderData 
        } 
      });
      return false;
    }
    return true;
  };

  const placePendingOrder = async () => {
    if (!pendingOrder || !isAuthenticated) return;

    try {
      const orderResult = await createOrder(pendingOrder);
      setPendingOrder(null);
      showNotification('Order placed successfully!', 'success');

      // IMPORTANT: clear cart after successful checkout
      try {
        await dispatch(clearRemoteCart()).unwrap();
      } catch (_) {
        // ignore; still clear UI cart
      }
      dispatch(deleteAllFromCart());

      navigate('/order-status', { 
        state: { order: orderResult } 
      });
      
      return orderResult;
    } catch (error) {
      throw error;
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    notification,
    pendingOrder,
    login,
    logout,
    requireAuth,
    placePendingOrder,
    showNotification,
    clearNotification,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
