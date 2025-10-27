import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';
import Header from '../Shared/SingleHeader';
import ProductService from '../../Services/ProductService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const ProductDetails = () => {
  const { productId } = useParams();
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products.find(p => p.ProductId.toString() === productId);

  const initialSize = product?.inventories.length > 0 ? product.inventories[0].size : '';
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [cartProducts, setCartProducts] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const selectedInventory = product?.inventories.find(inventory => inventory.size === selectedSize);

  useEffect(() => {
    const storedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
    setCartProducts(storedCartProducts);
    const storedWishlistProducts = JSON.parse(localStorage.getItem('wishlistProducts')) || [];
    setWishlistProducts(storedWishlistProducts);
  }, []);


  if (!product) {
    return <p>Product not found</p>;
  }

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleCartAction = (action, quantity = 1) => {
    let updatedCartProducts;

    switch (action) {
      case 'add':
        ProductService.handleAddToCart(product, selectedInventory);
        updatedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
        break;
      case 'change':
        updatedCartProducts = ProductService.handleChangeQuantity(selectedInventory.SKU, quantity);
        break;
      default:
        return;
    }

    setCartProducts(updatedCartProducts);
  };

  const handleAddToWishlist = () => {
    ProductService.handleAddToWishlist(product, selectedInventory);
    const updatedWishlistProducts = JSON.parse(localStorage.getItem('wishlistProducts')) || [];
    setWishlistProducts(updatedWishlistProducts);
  };

  const existingProduct = cartProducts.find(cartProduct => cartProduct.SKU === selectedInventory?.SKU);
  const isInWishlist = wishlistProducts.some(wishlistProduct => wishlistProduct.SKU === selectedInventory?.SKU);

  return (
    <div>
      <Header />
      <div className="product-details">
        <div className="image-container">
          <img src={product.img || 'path/to/default-image.jpg'} alt={product.name} />
        </div>
        <div className="details-container">
          <h1>{product.name}</h1>
          <p>{product.desc}</p>
          <p>Category: {product.category}</p>
          <p>Sub-Category: {product.subCategory}</p>
          <p>Discount: {product.discount}</p>
          <p>Vendor: {product.vendor}</p>
          <p>Country: {product.Country}</p>
          <p>Region: {product.Region}</p>
          <p>Brand: {product.brand}</p>
          <p>Taxable: {product.taxable ? 'Yes' : 'No'}</p>
          <h2>Sizes</h2>
          <div className="size-selector">
            {product.inventories.map((inventory, index) => (
              <button
                key={index}
                className={`size-box ${selectedSize === inventory.size ? 'selected' : ''}`}
                onClick={() => handleSizeChange(inventory.size)}
              >
                {inventory.size}
              </button>
            ))}
          </div>
          <p>Price: ${selectedInventory.price}</p>
          <p>Quantity: {selectedInventory.available ? 'In stock' : 'Out of stock'}</p>
          <p style={{ display: 'none' }}>SKU: {selectedInventory.SKU}</p>
          <div className="product-actions">
            {existingProduct ? (
              <div className="quantity-controls">
                <button className="quantity-button" onClick={() => handleCartAction('change', existingProduct.quantity - 1)}>
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="quantity">{existingProduct.quantity}</span>
                <button className="quantity-button" onClick={() => handleCartAction('change', existingProduct.quantity + 1)}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            ) : (
              <button className="action-button" onClick={() => handleCartAction('add')}>
                <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
              </button>
            )}
            <button className={`wishlist-button ${isInWishlist ? 'in-wishlist' : ''}`} onClick={handleAddToWishlist}>
              <FontAwesomeIcon icon={faHeart} /> {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

