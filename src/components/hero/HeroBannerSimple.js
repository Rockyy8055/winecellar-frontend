import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroBannerSimple = () => {
  const [productImages, setProductImages] = useState([]);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    // Fetch product images from the API
    const fetchProductImages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
        const data = await response.json();
        const images = data.map(product => product.img);
        setProductImages(images);
        setCurrentImage(images[Math.floor(Math.random() * images.length)]);
      } catch (error) {
        console.error('Error fetching product images:', error);
      }
    };

    fetchProductImages();
  }, []);

  useEffect(() => {
    // Set interval to change image every 5 seconds
    const interval = setInterval(() => {
      if (productImages.length > 0) {
        setCurrentImage(productImages[Math.floor(Math.random() * productImages.length)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [productImages]);

  return (
    <div className="hero-banner-simple" style={{ 
      background: '#fffef1', 
      color: '#350008',
      padding: '80px 0',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-12">
            <div className="hero-content" style={{ paddingRight: '40px' }}>
              <h1 className="hero-title" style={{
                fontSize: '72px',
                fontWeight: '700',
                fontFamily: 'Playfair Display, serif',
                color: '#350008',
                lineHeight: '1.2',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                Discover Your<br />Favorite Alcohol
              </h1>
              <p className="hero-subtitle" style={{
                fontSize: '24px',
                fontFamily: 'Inter, sans-serif',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                Browse our selection of high-quality liquors, craft beers, and fine wines.
              </p>
              <Link 
                to={"/shop-grid-standard"} 
                className="shop-now-btn"
                style={{
                  display: 'inline-block',
                  background: '#f5f5dc',
                  color: '#350008',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '24px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e8e8d0';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f5f5dc';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                Shop Now
              </Link>
            </div>
          </div>
          <div className="col-lg-6 col-md-12">
            <div className="hero-image-container" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            
              borderRadius: '20px',
              padding: '40px',
              
              
              minHeight: '600px'
            }}>
              {currentImage && (
                <img 
                  src={currentImage} 
                  alt="Product" 
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '350px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(53, 0, 8, 0.15))',
                    transition: 'all 0.3s ease'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBannerSimple;

