import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MobileNavMenu = () => {
  const { t } = useTranslation();

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
