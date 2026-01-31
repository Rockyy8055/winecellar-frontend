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
  const lastCartSnapshot = useRef(cartItems);

  useEffect(() => {
    lastCartSnapshot.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      const hydrate = async () => {
        const pendingItems = lastCartSnapshot.current;
        if (Array.isArray(pendingItems) && pendingItems.length) {
          try {
            await dispatch(pushCart()).unwrap();
          } catch (err) {
            console.warn('Failed to persist pre-login cart before hydrating:', err);
          }
        }

        skipNextPush.current = true;
        try {
          await dispatch(loadCart({ preserveLocalOnEmpty: true }));
        } finally {
          hasHydrated.current = true;
        }
      };

      hydrate();
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
