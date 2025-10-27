import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../Services/auth-api';
import { useTranslation } from "react-i18next";

const MobileNavMenu = () => {
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
          <Link to={"/"} onClick={closeMobileMenu}>{t("home")}</Link>
        </li>

        <li className="menu-item-has-children">
          <Link to={"/shop-grid-standard"} onClick={closeMobileMenu}>
            {t("shop")}
          </Link>
        </li>
        <li className="menu-item-has-children">
          <Link to={"/about-us"} onClick={closeMobileMenu}>
            {t("About Us")}
          </Link>
        </li>
        <li>
          <Link to={"/contact-us"} onClick={closeMobileMenu}>
            {t("Contact Us")}
          </Link>
        </li>
        <li>
          <Link to={"/trade-customer"} onClick={closeMobileMenu}>
            TRADE CUSTOMERS CLICK HERE
          </Link>
        </li>
        {!authed ? (
          <>
          <li><Link to={"/login"} onClick={closeMobileMenu}>Login</Link></li>
          <li><Link to={"/signup"} onClick={closeMobileMenu}>Sign Up</Link></li>
          </>
        ) : (
          <li><a href="#" onClick={async (e)=>{ e.preventDefault(); try { await fetch(new URL('/api/auth/logout', API_BASE).toString(), { method:'POST', credentials:'include' }); } catch(_){} closeMobileMenu(); window.location.reload(); }}>Logout</a></li>
        )}
        <li>
          <Link to={"/order-status"} onClick={closeMobileMenu}>
            TRACK ORDER
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MobileNavMenu;


