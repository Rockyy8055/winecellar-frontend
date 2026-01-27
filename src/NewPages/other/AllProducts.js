import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../layouts/Layout';
import ProductGridSingleTwo from '../../components/product/ProductGridSingleTwo';
import FilterDrawer from '../../components/product/FilterDrawer';
import {
  filterProductsByQuantityAndSort,
  getIndividualCategories,
} from '../../helpers/product';

const AllProducts = () => {
  const { products } = useSelector((state) => state.product);
  const currency = useSelector((state) => state.currency);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    sizes: [],
    sort: 'default',
  });

  // Category buttons
  const categories = useMemo(() => [
    'BOURBON WHISKEY', 'WINE', 'WHISKY', 'VODKA', 'TEQUILA',
    'RUM', 'LIQUOR', 'GIN', 'CHAMPAGNE', 'BRANDY'
  ], []);

  const mergedCategories = useMemo(() => {
    const dynamic = getIndividualCategories(products || []);
    return Array.from(new Set([...(categories || []), ...(dynamic || [])])).filter(Boolean);
  }, [categories, products]);

  const effectiveCategories = useMemo(() => {
    const manual = selectedCategory ? [selectedCategory] : [];
    return Array.from(new Set([...(filters.categories || []), ...manual])).filter(Boolean);
  }, [filters.categories, selectedCategory]);

  // Filter products based on search term and selected category
  const filteredProducts = useMemo(() => {
    let working = Array.isArray(products) ? [...products] : [];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      working = working.filter((product) =>
        product?.name?.toLowerCase().includes(lower)
      );
    }

    if (effectiveCategories.length) {
      working = working.filter((product) => {
        if (!product) return false;
        const raw = product.category;
        const normalized = Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
          ? [raw]
          : [];
        if (!normalized.length) return false;
        return normalized.some((cat) =>
          effectiveCategories.includes(String(cat))
        );
      });
    }

    return filterProductsByQuantityAndSort(working, {
      sizes: filters.sizes || [],
      sort: filters.sort || 'default',
    });
  }, [products, searchTerm, effectiveCategories, filters.sizes, filters.sort]);

  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? '' : category));
  };

  const handleApplyFilters = (next = {}) => {
    setFilters({
      categories: next.categories || [],
      sizes: next.sizes || [],
      sort: next.sort || 'default',
    });
    setDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({ categories: [], sizes: [], sort: 'default' });
    setSelectedCategory('');
  };

  const activeFilterCount =
    (filters.categories?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.sort !== 'default' ? 1 : 0) +
    (selectedCategory ? 1 : 0);

  return (
    <Layout
      headerContainerClass="container-fluid"
      headerPaddingClass="header-padding-2"
      headerTop="visible"
    >
      <div className="shop-area pt-100 pb-100">
        <div className="container-fluid" style={{ padding: '0 40px' }}>
          {/* Simple Search Bar */}
          <div className="row mb-4">
            <div className="col-lg-12">
              <div className="text-center">
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    maxWidth: '1000px',
                    width: '100%',
                    margin: '0 auto',
                    border: '2px solid #ddd',
                    borderRadius: '28px',
                    padding: '18px 32px',
                    fontSize: '20px',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.08)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="row mb-4">
            <div className="col-lg-12">
              <div className="category-filter-section" style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, color: '#350008' }}>Filter by Category</h4>
                  <button
                    type="button"
                    className="filter-trigger-btn"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <span className="filter-trigger-btn__text">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="filter-trigger-btn__badge">{activeFilterCount}</span>
                    )}
                  </button>
                </div>
                <div className="d-flex flex-wrap justify-content-center" style={{ gap: '12px 12px', position: 'relative' }}>
                  {categories.map((category) => (
                    <div
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' ? handleCategoryClick(category) : null)}
                      className={`category-btn ${selectedCategory === category ? 'selected' : ''}`}
                      style={{
                        flex: '1 1 140px',
                        maxWidth: '200px',
                        padding: '12px 10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        borderRadius: '25px',
                        border: '2px solid #350008',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
                {(selectedCategory || activeFilterCount > 0) && (
                  <div className="text-center mt-3">
                    <button
                      onClick={handleClearFilters}
                      className="btn btn-sm btn-secondary"
                      style={{ 
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: 'bold'
                      }}
                    >
                      Remove Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="shop-header" style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.6rem' }}>All Products</h2>
                <p style={{ fontSize: '0.95rem' }}>Showing {filteredProducts.length} products</p>
                {(searchTerm || selectedCategory) && (
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {searchTerm && `Search results for: "<strong>${searchTerm}</strong>"`}
                    {searchTerm && selectedCategory && ' and '}
                    {selectedCategory && `Filtered by: "<strong>${selectedCategory}</strong>"`}
                  </p>
                )}
              </div>
              
              <div className="product-grid">
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.ProductId}>
                      <ProductGridSingleTwo
                        product={product}
                        currency={currency}
                        cartItem={
                          cartItems.find((cartItem) => cartItem.ProductId === product.ProductId)
                        }
                        wishlistItem={
                          wishlistItems.find(
                            (wishlistItem) => wishlistItem.ProductId === product.ProductId
                          )
                        }
                        compareItem={
                          compareItems.find(
                            (compareItem) => compareItem.ProductId === product.ProductId
                          )
                        }
                        spaceBottomClass="mb-25"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <h3>No products found</h3>
                    <p>
                      {searchTerm || selectedCategory
                        ? `No products match your search criteria. Try adjusting your search or filter.`
                        : 'No products available at the moment.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        categories={mergedCategories}
        selectedCategories={filters.categories}
        selectedSizes={filters.sizes}
        selectedSort={filters.sort}
        title="Filters"
      />
    </Layout>
  );
};

export default AllProducts; 

