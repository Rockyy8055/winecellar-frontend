import PropTypes from "prop-types";
import clsx from "clsx";
import { Link } from "react-router-dom";

const Logo = ({ imageUrl, logoClass }) => {
  return (
    <div className={clsx(logoClass)}>
      <Link to={process.env.PUBLIC_URL + "/"}>
        <img 
          alt="" 
          src={process.env.PUBLIC_URL + imageUrl} 
                      style={{
              maxHeight: '200px',
              maxWidth: '200px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              transform: 'translateY(-20px)'
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
