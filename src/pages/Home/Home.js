
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../Shared/Header';
import ProductCard from '../ProductCard/ProductCard';
import ProductService from '../../Services/ProductService';
import Banner from './Banner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import './Home.css';


const underlineVariants = (width) => ({
  initial: { width: 0 },
  hover: { width: `${width}px` },
});

const Home = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [textWidths, setTextWidths] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      const products = await ProductService.getProducts();
      setProducts(products);
      if (products.length > 0) {
        setSelectedCategory(products[0].category); 
      }
    };

    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(product => product.category))];

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const measureRef = useCallback((node, category) => {
    if (node !== null) {
      const width = node.getBoundingClientRect().width;
      setTextWidths((prevWidths) => {
        if (prevWidths[category] !== width) {
          return {
            ...prevWidths,
            [category]: width,
          };
        }
        return prevWidths;
      });
    }
  }, []);
  return (
    <div>
      <Header />
      <Banner />
      <div className="Product-message">Shop your favorite drinks
      <div className="sub-message-container">
      <div className="sub-message">Explore the wide selection of new, limited products
      </div>
      <Link
            to="/all-products"
            className="view-all-link"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            | View All <FontAwesomeIcon icon={isHovered ? faArrowRight : faAngleRight} className="arrow-icon" /></Link>
            </div>
      </div>
      <div className="category-tabs">
        {categories.map(category => (
          <motion.button
          key={category}
          className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category)}
          whileHover="hover"
          initial="initial"
        >
          <span ref={(node) => measureRef(node, category)}>{category}</span>
            <motion.div
              className={`underline ${selectedCategory === category ? 'active-underline' : ''}`}
              style={selectedCategory === category ? { width: `${textWidths[category]}px`} : {'width': '0px'} }
              variants={selectedCategory !== category ? underlineVariants(textWidths[category]) : {}}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        ))}
      </div>
      <div className="product-list">
        {products
          .filter(product => product.category === selectedCategory)
          .slice(0, 5) 
          .map(product => (
            <ProductCard key={product.ProductId} product={product} />
          ))}
      </div>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2023 Wine Seller. All rights reserved.</p>
          <p>Contact us: info@wineseller.com</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

