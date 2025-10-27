import PropTypes from "prop-types";
import clsx from "clsx";
import featureIconData from "../../data/feature-icons/feature-icon-six.json";
import FeatureIconSixSingle from "../../components/feature-icon/FeatureIconSixSingle.js";

const FeatureIconSix = ({ spaceTopClass, spaceBottomClass }) => {
  return (
    <div className={clsx("support-area", spaceTopClass, spaceBottomClass)}>
      <div className="container">
        <div className="row align-items-stretch" style={{ borderBottom: '1px solid #eee' }}>
          <div className="col-md-6" style={{ borderRight: '1px solid #eee' }}>
            <div className="h-100 d-flex align-items-center justify-content-start" style={{ padding: '20px' }}>
              <FeatureIconSixSingle data={featureIconData[0]} textAlignClass="text-left" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="h-100 d-flex align-items-center justify-content-end" style={{ padding: '20px' }}>
              <FeatureIconSixSingle data={featureIconData[1]} textAlignClass="text-right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FeatureIconSix.propTypes = {
  spaceBottomClass: PropTypes.string,
  spaceTopClass: PropTypes.string
};

export default FeatureIconSix;


