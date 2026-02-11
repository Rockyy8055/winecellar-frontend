import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import './assets/css/responsive-overrides.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "./assets/scss/style.scss";
import "./i18n";
import 'animate.css';
import 'swiper/css/bundle';
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { store } from "./store/store";
import { setProducts } from "./store/slices/product-slice";
import { mapProductPayload } from "./Services/product-admin-api";
//import products from "./data/products.json";
import { Provider } from 'react-redux';

const fetchProducts = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';
    if (!apiUrl) throw new Error('API base URL not set. Set REACT_APP_API_URL or VITE_API_BASE');
    console.log('Fetching products from:', `${apiUrl}/api/product/get`);
    
    const response = await fetch(`${apiUrl}/api/product/get`, { credentials: 'include' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.json();
    const normalizedProducts = Array.isArray(products) ? products.map(mapProductPayload) : [];
    console.log('Products fetched successfully:', normalizedProducts.length, 'products');
    store.dispatch(setProducts(normalizedProducts));
  } catch (error) {
    console.error('Failed to fetch products from backend:', error);
    console.log('Using fallback local products...');
    // You can add fallback to local products here if needed
  }
};

fetchProducts();

//store.dispatch(setProducts());
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </Provider>
);
reportWebVitals();
