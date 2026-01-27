import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { resolveImageSource } from '../../utils/image';
import { deleteAllFromCart } from '../../store/slices/cart-slice';
import './cart-bottom-bar.css';

const CartBottomBar = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  const dispatch = useDispatch();

  const ALLOWED_PATHS = useMemo(() => ([
    '',
    '/',
    '/home',
    '/shop-grid-standard'
  ]), []);

  const isAllowedRoute = useMemo(() => {
    const raw = location?.pathname || '';
    const normalized = raw.replace(/\/+/g, '/').toLowerCase();
    return ALLOWED_PATHS.includes(normalized);
  }, [ALLOWED_PATHS, location?.pathname]);

  const hasItems = cartItems && cartItems.length > 0;
  const firstItem = hasItems ? cartItems[0] : null;
  const restItems = hasItems ? cartItems.slice(1) : [];

  const summary = useMemo(() => {
    if (!hasItems) {
      return {
        totalQuantity: 0,
        totalPrice: '0.00'
      };
    }
    const totalQuantity = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const rawTotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      return sum + price * qty;
    }, 0);
    const converted = Number(currency?.currencyRate || 1) * rawTotal;
    return {
      totalQuantity,
      totalPrice: converted.toFixed(2)
    };
  }, [cartItems, currency, hasItems]);

  useEffect(() => {
    const root = document.documentElement;
    if (hasItems) {
      root.style.setProperty('--cart-bar-height', '110px');
    } else {
      root.style.removeProperty('--cart-bar-height');
      setExpanded(false);
    }
    return () => {
      root.style.removeProperty('--cart-bar-height');
    };
  }, [hasItems]);

  useEffect(() => {
    const normalized = (location?.pathname || '').replace(/\/+/g, '/').toLowerCase();
    if (normalized === '/cart' || normalized === '/checkout') {
      setExpanded(false);
    }
  }, [location?.pathname]);

  if (!hasItems || !firstItem || !isAllowedRoute) return null;

  const moreCount = restItems.length;
  const displaySize = firstItem.selectedProductSize || firstItem.size || '';

  const handleClearCart = () => {
    dispatch(deleteAllFromCart());
    setExpanded(false);
  };

  return (
    <div className={clsx('cart-bottom-bar', expanded && 'cart-bottom-bar--expanded')}>
      <div className="cart-bottom-bar__inner">
        <div className="cart-bottom-bar__left">
          <div className="cart-bottom-bar__thumb">
            <img
              src={resolveImageSource(firstItem.img, firstItem.imageUrl)}
              alt={firstItem.name}
            />
          </div>
          <div className="cart-bottom-bar__details">
            <span className="cart-bottom-bar__label">Just added</span>
            <span className="cart-bottom-bar__title">{firstItem.name}</span>
            <div className="cart-bottom-bar__meta">
              <span>Qty: {firstItem.quantity}</span>
              {displaySize ? <span>Size: {displaySize}</span> : null}
            </div>
          </div>
          {moreCount > 0 && (
            <button
              type="button"
              className="cart-bottom-bar__more"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-label={`View ${moreCount} more item${moreCount > 1 ? 's' : ''}`}
            >
              +{moreCount}
              <span className="cart-bottom-bar__more-dots">···</span>
            </button>
          )}
        </div>
        <div className="cart-bottom-bar__right">
          <button
            type="button"
            className="cart-bottom-bar__clear"
            onClick={handleClearCart}
            aria-label="Clear cart"
          >
            ×
          </button>
          <div className="cart-bottom-bar__summary">
            <span>{summary.totalQuantity} item{summary.totalQuantity === 1 ? '' : 's'}</span>
            <span>{currency?.currencySymbol || ''}{summary.totalPrice}</span>
          </div>
          <Link to="/Cart" className="cart-bottom-bar__cta">
            View Cart
          </Link>
        </div>
      </div>
      {expanded && moreCount > 0 && (
        <div className="cart-bottom-bar__drawer" role="dialog" aria-label="Additional cart items">
          <ul>
            {restItems.map((item) => {
              const sizeLabel = item.selectedProductSize || item.size || '';
              return (
                <li key={item.cartItemId} className="cart-bottom-bar__drawer-item">
                  <img src={resolveImageSource(item.img, item.imageUrl)} alt={item.name} />
                  <div>
                    <div className="cart-bottom-bar__drawer-title">{item.name}</div>
                    <div className="cart-bottom-bar__drawer-meta">
                      <span>Qty: {item.quantity}</span>
                      {sizeLabel ? <span>Size: {sizeLabel}</span> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CartBottomBar;
