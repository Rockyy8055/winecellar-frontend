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
      <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', paddingRight: 'min(34vw, 420px)' }}>
        <ul style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0, listStyle: 'none', gap: 28, whiteSpace: 'nowrap' }}>
          <li>
            <Link to={process.env.PUBLIC_URL + "/"} style={{ fontSize: '24px', fontWeight: '700', marginTop: '10px' }}>
              {t("Home")}
            </Link>
          </li>
          <li>
            <Link to={process.env.PUBLIC_URL + "/shop-grid-standard"} style={{ fontSize: '24px', fontWeight: '700', marginTop: '10px' }}>
              {t("Shop")}
            </Link>
          </li>
          <li>
            <Link to={process.env.PUBLIC_URL + "/about-us"} style={{ fontSize: '24px', fontWeight: '700', marginTop: '10px' }}>
              {t("About Us")}
            </Link>
          </li>
          <li>
            <Link to={process.env.PUBLIC_URL + "/contact-us"} style={{ fontSize: '24px', fontWeight: '700', marginTop: '10px' }}>
              {t("Contact Us")}
            </Link>
          </li>
        </ul>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12, whiteSpace: 'nowrap' }}>
          <Link 
            to={process.env.PUBLIC_URL + "/trade-customer"} 
            style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              marginTop: '10px',
              background: '#350008',
              color: '#fffef1',
              padding: '20px 10px',
              borderRadius: '30px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            TRADE CUSTOMERS CLICK HERE
          </Link>
          <Link 
            to={process.env.PUBLIC_URL + "/order-status"}
            style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              marginTop: '10px',
              background: '#350008',
              color: '#fffef1',
              padding: '20px 10px',
              borderRadius: '30px',
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
