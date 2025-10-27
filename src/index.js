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
//import products from "./data/products.json";
import { Provider } from 'react-redux';
import { API_URL } from './utils/apiConfig';
import { Capacitor } from '@capacitor/core';

const fetchProducts = async () => {
  const apiUrl = API_URL;
  const fullUrl = `${apiUrl}/api/product/get`;
  
  console.log('Fetching products from:', fullUrl);
  
  // Use XMLHttpRequest for better WebView compatibility
  const xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    try {
      if (xhr.status === 200) {
        const products = JSON.parse(xhr.responseText);
        console.log('✅ Products loaded from backend:', products.length);
        console.log('✅ Dispatching to Redux store...');
        store.dispatch(setProducts(products));
        console.log('✅ Products dispatched to Redux!');
        
        // Verify products are in store
        setTimeout(() => {
          const state = store.getState();
          console.log('✅ Redux state after dispatch:', state.product.products.length);
        }, 100);
      } else {
        throw new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
      }
    } catch (error) {
      console.error('❌ Parse error:', error);
    }
  };
  
  xhr.onerror = function() {
    console.error('Network error');
  };
  
  xhr.ontimeout = function() {
    console.error('Request timeout');
  };
  
  try {
    xhr.open('GET', fullUrl, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.timeout = 30000; // 30 second timeout
    xhr.send();
  } catch (error) {
    console.error('XHR error:', error);
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


