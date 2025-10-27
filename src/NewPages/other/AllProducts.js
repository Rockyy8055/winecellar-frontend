import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import ProductGridSingleTwo from '../../components/product/ProductGridSingleTwo';

const wineSubcategories = [
  'WHITE WINE',
  'RED WINE',
  'ORANGE WINE',
  'ROSE WINE'
];

const AllProducts = () => {
  const { products } = useSelector((state) => state.product);
  const currency = useSelector((state) => state.currency);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [wineHover, setWineHover] = useState(false);

  // Debug logging
  console.log('AllProducts - Products from Redux:', products);
  console.log('AllProducts - Products length:', products ? products.length : 0);
  console.log('AllProducts - Products type:', typeof products);
  console.log('AllProducts - Is Array:', Array.isArray(products));

  // Category buttons
  const categories = [
    'BOURBON WHISKEY', 'WINE', 'WHISKY', 'VODKA', 'TEQUILA',
    'RUM', 'LIQUOR', 'GIN', 'CHAMPAGNE', 'BRANDY'
  ];

  // Normalize and map friendly category size defaults
  const wineLike = ['WINE'];
  const spiritLike = ['WHISKY','VODKA','TEQUILA','RUM','LIQUOR','GIN','CHAMPAGNE','BRANDY','BOURBON WHISKEY'];

  // Filter products based on search term and selected category
  const filteredProducts = (products && Array.isArray(products)) ? products.filter(product => {
    if (!product || !product.name) return false;
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || 
      (Array.isArray(product.category)
        ? product.category.some(cat => cat && cat.toLowerCase() === selectedCategory.toLowerCase())
        : (typeof product.category === 'string' && product.category.toLowerCase() === selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  }) : [];
  
  console.log('AllProducts - Filtered products length:', filteredProducts.length);

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleWineSubcategoryClick = (subcategory) => {
    setSelectedCategory(subcategory);
    setWineHover(false);
  };

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
                <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#350008' }}>
                  Filter by Category
                </h4>
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
                {selectedCategory && (
                  <div className="text-center mt-3">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="btn btn-sm btn-secondary"
                      style={{ 
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: 'bold'
                      }}
                    >
                      Clear Filter
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
    </Layout>
  );
};

export default AllProducts; 

