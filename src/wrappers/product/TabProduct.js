import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useSelector } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import SectionTitle from "../../components/section-title/SectionTitle";
import ProductGridTwo from "./ProductGridTwo";
import FilterDrawer from "../../components/product/FilterDrawer";
import {
  filterProductsByQuantityAndSort,
  getIndividualCategories,
} from "../../helpers/product";

const TabProductTwo = ({ spaceBottomClass, category }) => {
  const { products } = useSelector((state) => state.product);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    sizes: [],
    sort: "default",
  });

  const availableCategories = useMemo(
    () => getIndividualCategories(products || []),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let working = Array.isArray(products) ? [...products] : [];

    if (filters.categories?.length) {
      working = working.filter((product) => {
        if (!product) return false;
        const productCategories = Array.isArray(product.category)
          ? product.category
          : typeof product.category === "string"
          ? [product.category]
          : [];
        if (!productCategories.length) return false;
        return productCategories.some((cat) => filters.categories.includes(cat));
      });
    }

    return filterProductsByQuantityAndSort(working, {
      sizes: filters.sizes || [],
      sort: filters.sort || "default",
    });
  }, [products, filters]);

  const handleApplyFilters = (next = {}) => {
    setFilters({
      categories: next.categories || [],
      sizes: next.sizes || [],
      sort: next.sort || "default",
    });
    setDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({ categories: [], sizes: [], sort: "default" });
  };

  const activeFilterCount =
    (filters.categories?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.sort !== "default" ? 1 : 0);

  return (
    <div className={clsx("product-area", spaceBottomClass)}>
      <div className="container">
        <div className="product-area__header">
          <SectionTitle titleText="DAILY DEALS!" positionClass="text-center" />
          <button
            type="button"
            className="filter-trigger-btn"
            onClick={() => setDrawerOpen(true)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-trigger-btn__badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
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
                  productsOverride={filteredProducts}
                />
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        categories={availableCategories}
        selectedCategories={filters.categories}
        selectedSizes={filters.sizes}
        selectedSort={filters.sort}
        title="Filters"
      />
    </div>
  );
};

TabProductTwo.propTypes = {
  category: PropTypes.string,
  spaceBottomClass: PropTypes.string
};

export default TabProductTwo;


