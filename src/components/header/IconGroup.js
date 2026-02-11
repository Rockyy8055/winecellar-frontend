import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import { API_BASE } from '../../Services/auth-api';
import { useAuth } from "../../contexts/AuthContext";
import clsx from "clsx";
import MenuCart from "./sub-components/MenuCart";

const IconGroup = ({ iconWhiteClass }) => {
  const handleClick = e => {
    e.currentTarget.nextSibling.classList.toggle("active");
  };

  const triggerMobileMenu = () => {
    const offcanvasMobileMenu = document.querySelector(
      "#offcanvas-mobile-menu"
    );
    offcanvasMobileMenu.classList.add("active");
  };
  /* const { compareItems } = useSelector((state) => state.compare); */
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);
  const [authed, setAuthed] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(new URL('/api/auth/me', API_BASE).toString(), { credentials: 'include' });
      setAuthed(res.ok);
    } catch (_) { setAuthed(false); }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAuthed(false);
    } catch(_) {
      setAuthed(false);
    }
  };

  return (
    <div className={clsx("header-right-wrap", iconWhiteClass)} >
      <div className="same-style account-setting d-none d-lg-block">
        <button
          className="account-setting-active"
          onClick={e => handleClick(e)}
          style={{ fontSize: '38px', background:'#fffef1', border:'2px solid #350008', borderRadius:8, color:'#350008' }}
        >
          <i className="pe-7s-user-female" style={{ color:'#350008' }} />
        </button>
        <div className="account-dropdown" style={{ background:'#fffef1', border:'2px solid #350008' }}>
          <ul>
            {!authed ? (
              <>
                <li><Link to={process.env.PUBLIC_URL + "/login"} style={{ color:'#350008' }}>Login</Link></li>
                <li><Link to={process.env.PUBLIC_URL + "/signup"} style={{ color:'#350008' }}>Sign Up</Link></li>
              </>
            ) : (
              <>
                <li><Link to={process.env.PUBLIC_URL + "/my-orders"} style={{ color:'#350008' }}>My Orders</Link></li>
                <li>
                  <button
                    type="button"
                    style={{ color:'#350008', background:'transparent', border:'none', padding:0, cursor:'pointer' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="same-style account-setting d-block d-lg-none">
        <Link
          to={process.env.PUBLIC_URL + (authed ? "/my-orders" : "/login")}
          style={{ fontSize: '34px', color: '#350008', display: 'flex', alignItems: 'center' }}
          aria-label={authed ? 'My Orders' : 'Login'}
        >
          <i className="pe-7s-user-female" style={{ color: '#350008' }} />
        </Link>
      </div>
      <div className="same-style header-wishlist">
        <Link to={process.env.PUBLIC_URL + "/Wishlist"} style={{ fontSize: '34px', color: '#350008', display: 'flex', alignItems: 'center' }}>
          <i className="pe-7s-like" style={{ color: '#350008' }} />
          <span className="count-style">
            {wishlistItems && wishlistItems.length ? wishlistItems.length : 0}
          </span>
        </Link>
      </div>
      <div className="same-style cart-wrap d-none d-lg-block">
        <button className="icon-cart" onClick={e => handleClick(e)} style={{ fontSize: '38px' }}>
          <i className="pe-7s-shopbag" />
          <span className="count-style">
            {cartItems && cartItems.length ? cartItems.length : 0}
          </span>
        </button>
        {/* menu cart */}
        <MenuCart />
      </div>
      <div className="same-style cart-wrap d-block d-lg-none">
        <Link className="icon-cart" to={process.env.PUBLIC_URL + "/Cart"} style={{ fontSize: '34px', color: '#350008', display: 'flex', alignItems: 'center' }}>
          <i className="pe-7s-shopbag" style={{ color: '#350008' }} />
          <span className="count-style">
            {cartItems && cartItems.length ? cartItems.length : 0}
          </span>
        </Link>
      </div>
      <div className="same-style mobile-off-canvas d-block d-lg-none">
        <button
          className="mobile-aside-button"
          onClick={() => triggerMobileMenu()}
          style={{ fontSize: '34px', color: '#350008', display: 'flex', alignItems: 'center' }}
          aria-label="Open menu"
        >
          <i className="pe-7s-menu" style={{ color: '#350008' }} />
        </button>
      </div>
    </div>
  );
};

IconGroup.propTypes = {
  iconWhiteClass: PropTypes.string,
};



export default IconGroup;
