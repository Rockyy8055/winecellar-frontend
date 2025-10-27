import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const HeroSliderNineteenSingle = ({ data }) => {
  return (
    <Link to={"/shop-grid-standard"} style={{ display: 'block' }}>
      <div
        className="single-slider-2 slider-height-2 d-flex align-items-center bg-img"
        style={{ 
          backgroundImage: `url(${process.env.PUBLIC_URL + data.image})`,
          height: '70vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100vw',
          cursor: 'pointer'
        }}
      >
      </div>
    </Link>
  );
};

HeroSliderNineteenSingle.propTypes = {
  data: PropTypes.shape({})
};

export default HeroSliderNineteenSingle;


