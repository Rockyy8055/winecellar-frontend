import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

const NavMenu = ({ menuWhiteClass, sidebarMenu }) => {
  const { t } = useTranslation();
  
  return (
    <div
      className={clsx(sidebarMenu
          ? "sidebar-menu"
          : `main-menu ${menuWhiteClass ? menuWhiteClass : ""}`)}
    >
      <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: '6px 0', paddingRight: 'min(36vw, 480px)' }}>
        <ul style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0, listStyle: 'none', gap: 16, whiteSpace: 'nowrap' }}>
          <li>
            <Link to="/" style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>
              {t("Home")}
            </Link>
          </li>
          <li>
            <Link to="/shop-grid-standard" style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>
              {t("Shop")}
            </Link>
          </li>
          <li>
            <Link to="/about-us" style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>
              {t("About Us")}
            </Link>
          </li>
          <li>
            <Link to="/contact-us" style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>
              {t("Contact Us")}
            </Link>
          </li>
        </ul>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 8, paddingRight: 10, whiteSpace: 'nowrap' }}>
          <Link 
            to="/trade-customer" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              marginTop: '6px',
              background: '#350008',
              color: '#fffef1',
              padding: '10px 10px',
              borderRadius: '20px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            TRADE CUSTOMERS CLICK HERE
          </Link>
          <Link 
            to="/order-status"
            style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              marginTop: '6px',
              background: '#350008',
              color: '#fffef1',
              padding: '10px 10px',
              borderRadius: '20px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            TRACK ORDER
          </Link>
        </div>
      </nav>
    </div>
  );
};

NavMenu.propTypes = {
  menuWhiteClass: PropTypes.string,
  sidebarMenu: PropTypes.bool,
};

export default NavMenu;


