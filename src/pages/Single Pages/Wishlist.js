// FILE: pages/Wishlist.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wishlist.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWishlistProducts = JSON.parse(localStorage.getItem('wishlistProducts')) || [];
    setWishlistProducts(storedWishlistProducts);
  }, []);

  const handleHomeClick = () => {
    navigate('/Home');
  };

  const handleRemoveFromWishlist = (index) => {
    const updatedWishlistProducts = [...wishlistProducts];
    updatedWishlistProducts.splice(index, 1);
    setWishlistProducts(updatedWishlistProducts);
    localStorage.setItem('wishlistProducts', JSON.stringify(updatedWishlistProducts));
  };

  return (
    <div>
      <header className="wishlist-header">
        <button className="home-button" onClick={handleHomeClick}>Home</button>
      </header>
      <h1>Wishlist</h1>
      {wishlistProducts && wishlistProducts.length > 0 ? (
        <div className="wishlist-container">
          {wishlistProducts.map((product, index) => (
            <div key={index} className="wishlist-item">
                  <button className="remove-button" onClick={() => handleRemoveFromWishlist(index)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h2>{product.name}</h2>
              <img src={product.img} alt={product.name} />
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No products in the wishlist.</p>
      )}
    </div>
  );
};

export default Wishlist;

