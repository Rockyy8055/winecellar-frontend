import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCart, pushCart, deleteAllFromCart } from '../../store/slices/cart-slice';
import { useAuth } from '../../contexts/AuthContext';

const CartSyncManager = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartStatus = useSelector((state) => state.cart.status);

  const hasHydrated = useRef(false);
  const skipNextPush = useRef(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      skipNextPush.current = true;
      dispatch(loadCart())
        .finally(() => {
          hasHydrated.current = true;
        });
    } else {
      hasHydrated.current = false;
      skipNextPush.current = false;
      dispatch(deleteAllFromCart());
    }
  }, [isAuthenticated, authLoading, dispatch]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    if (!hasHydrated.current) {
      return;
    }

    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    if (cartStatus === 'loading') {
      return;
    }

    dispatch(pushCart());
  }, [cartItems, isAuthenticated, authLoading, cartStatus, dispatch]);

  return null;
};

export default CartSyncManager;
