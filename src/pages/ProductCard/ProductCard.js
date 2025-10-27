import React, { useState, useEffect }  from "react";
import "./ProductCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faHeart, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import ProductService from '../../Services/ProductService';
import fixedImage from '../../assets/Products/Noimage.png';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const navigate = useNavigate();

  // Support both new backend structure and old inventories array
  let firstInventory = null;
  if (Array.isArray(product.inventories) && product.inventories.length > 0) {
    firstInventory = product.inventories.find((inventory) => inventory.available) || product.inventories[0];
  } else {
    // Use root-level fields as a pseudo-inventory
    firstInventory = {
      price: product.price,
      SKU: product.SKU,
      tags: product.tags,
      size: product.size,
      available: true
    };
  }

  useEffect(() => {
    const storedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
    setCartProducts(storedCartProducts);
    const storedWishlistProducts = JSON.parse(localStorage.getItem('wishlistProducts')) || [];
    setWishlistProducts(storedWishlistProducts);
  }, []);

  const handleCartAction = (action,quantity = 1) => {
    let updatedCartProducts;
    switch (action) {
      case 'add':
        ProductService.handleAddToCart(product, firstInventory);
        updatedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
        break;
      case 'change':
        updatedCartProducts = ProductService.handleChangeQuantity(firstInventory.SKU, quantity);
        break;
      default:
        return;
    }
    setCartProducts(updatedCartProducts);
  };

  const handleAddToWishlist = () => {
    ProductService.handleAddToWishlist(product, firstInventory);
    const updatedWishlistProducts = JSON.parse(localStorage.getItem('wishlistProducts')) || [];
    setWishlistProducts(updatedWishlistProducts);
  };
  const handleProductClick = () => {
    navigate(`/product/${product.ProductId}`);
  };
  const existingProduct = cartProducts.find(cartProduct => cartProduct.SKU === firstInventory?.SKU);
  const isInWishlist = wishlistProducts.some(wishlistProduct => wishlistProduct.SKU === firstInventory?.SKU);

  // Use product image from backend or fallback
  const getProductImage = (product) => {
    return product.img || fixedImage;
  };
  const productImage = getProductImage(product);

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="image-container">
      <img src={productImage} alt={product.name} className="product-image" />
      <div className="wishlist-icon">
        <button className={`wishlist-button ${isInWishlist ? 'in-wishlist' : ''}`} onClick={(e) => { e.stopPropagation(); handleAddToWishlist(); }}>
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </div>
      </div>
      <h2>{product.name}</h2>
      {firstInventory && firstInventory.available ? (
        <>
          <p>Price: ${firstInventory.price}</p>
          <p>Size: {firstInventory.size}</p>
          <p className="stock-status available">
              <span className="status-dot"></span> In stock
            </p>
          <div className="product-actions">
          {existingProduct ? (
              <div className="quantity-controls">
                <button className="quantity-button" onClick={(e) =>{e.stopPropagation();  handleCartAction('change', existingProduct.quantity - 1)}}>
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="quantity">{existingProduct.quantity}</span>
                <button className="quantity-button" onClick={(e) =>{e.stopPropagation();  handleCartAction('change', existingProduct.quantity + 1)}}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            ) : (
              <button className="action-button" onClick={(e) =>{e.stopPropagation(); handleCartAction('add')}}>
                <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="stock-status out-of-stock">
          <span className="status-dot"></span> Out of stock
        </p>
      )}
    </div>
  );
};

export default ProductCard;


