import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ReactDOM from 'react-dom/client';
import './index.css';
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
//import products from "./data/products.json";
import { Provider } from 'react-redux';

const fetchProducts = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('Fetching products from:', `${apiUrl}/api/product/get`);
    
    const response = await fetch(`${apiUrl}/api/product/get`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.json();
    console.log('Products fetched successfully:', products.length, 'products');
    store.dispatch(setProducts(products));
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
