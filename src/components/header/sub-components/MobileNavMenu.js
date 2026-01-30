import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../Services/auth-api';
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const MobileNavMenu = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [authed, setAuthed] = useState(false);
  useEffect(() => { (async () => { try { const r = await fetch(new URL('/api/auth/me', API_BASE).toString(), { credentials:'include' }); setAuthed(r.ok); } catch(_) { setAuthed(false); } })(); }, []);

  const closeMobileMenu = () => {
    const offcanvas = document.querySelector('#offcanvas-mobile-menu');
    if (offcanvas) offcanvas.classList.remove('active');
  };

  return (
    <nav className="offcanvas-navigation" id="offcanvas-navigation">
      <ul>
        <li className="menu-item-has-children">
          <Link to={process.env.PUBLIC_URL + "/"} onClick={closeMobileMenu}>{t("home")}</Link>
        </li>

        <li className="menu-item-has-children">
          <Link to={process.env.PUBLIC_URL + "/shop-grid-standard"} onClick={closeMobileMenu}>
            {t("shop")}
          </Link>
        </li>
        <li className="menu-item-has-children">
          <Link to={process.env.PUBLIC_URL + "/about-us"} onClick={closeMobileMenu}>
            {t("About Us")}
          </Link>
        </li>
        <li>
          <Link to={process.env.PUBLIC_URL + "/contact-us"} onClick={closeMobileMenu}>
            {t("Contact Us")}
          </Link>
        </li>
        <li>
          <Link to={process.env.PUBLIC_URL + "/trade-customer"} onClick={closeMobileMenu}>
            TRADE CUSTOMERS CLICK HERE
          </Link>
        </li>
        {!authed ? (
          <>
          <li><Link to={process.env.PUBLIC_URL + "/login"} onClick={closeMobileMenu}>Login</Link></li>
          <li><Link to={process.env.PUBLIC_URL + "/signup"} onClick={closeMobileMenu}>Sign Up</Link></li>
          </>
        ) : (
          <li>
            <button
              type="button"
              onClick={async ()=>{ try { await logout(); } catch(_){} closeMobileMenu(); }}
              style={{ background:'transparent', border:'none', padding:0, cursor:'pointer', color:'inherit' }}
            >
              Logout
            </button>
          </li>
        )}
        <li>
          <Link to={process.env.PUBLIC_URL + "/order-status"} onClick={closeMobileMenu}>
            TRACK ORDER
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MobileNavMenu;
