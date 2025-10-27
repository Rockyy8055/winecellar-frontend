import PropTypes from "prop-types";
import clsx from "clsx";
import { Link } from "react-router-dom";

const Logo = ({ imageUrl, logoClass }) => {
  return (
    <div className={clsx(logoClass)}>
      <Link to="/" onClick={() => window.scrollTo(0, 0)}>
        <img 
          alt="" 
          src={process.env.PUBLIC_URL + imageUrl} 
                      style={{
              maxHeight: '48px',
              maxWidth: '180px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
        />
      </Link>
    </div>
  );
};

Logo.propTypes = {
  imageUrl: PropTypes.string,
  logoClass: PropTypes.string
};

export default Logo;


