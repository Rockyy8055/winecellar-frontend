import PropTypes from "prop-types";
import clsx from "clsx"
import { Link } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import SectionTitle from "../../components/section-title/SectionTitle";
import ProductGridTwo from "./ProductGridTwo";

const TabProductTwo = ({ spaceBottomClass, category }) => {
  return (
    <div className={clsx("product-area", spaceBottomClass)}>
      <div className="container">
        <SectionTitle titleText="DAILY DEALS!" positionClass="text-center" />
        <Tab.Container defaultActiveKey="bestSeller">
          <Nav
            variant="pills"
            className="product-tab-list pt-30 pb-55 text-center"
          >
            <Nav.Item>
              
                <h4 className="custom-heading">Best Selling Products</h4>
              
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="bestSeller">
              <div className="row three-column">
                <ProductGridTwo
                  category={category}
                  limit={6}
                  spaceBottomClass="mb-25"
                />
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
        <div className="view-more text-center mt-20 toggle-btn6 col-12">
          <Link
            className="view-more-products-btn"
            to={process.env.PUBLIC_URL + "/shop-grid-standard"}
            style={{
              display: 'inline-block',
              background: '#111',
              color: '#fffef1',
              fontWeight: 700,
              fontSize: '1.35rem',
              padding: '22px 60px',
              borderRadius: '32px',
              border: 'none',
              letterSpacing: '1px',
              margin: '18px 0 0 0',
              boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
              transition: 'transform 0.18s cubic-bezier(.23,1.02,.64,.97), background 0.18s',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            VIEW MORE PRODUCTS
          </Link>
        </div>
      </div>
    </div>
  );
};

TabProductTwo.propTypes = {
  category: PropTypes.string,
  spaceBottomClass: PropTypes.string
};

export default TabProductTwo;
