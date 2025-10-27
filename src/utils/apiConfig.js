// Centralized API configuration for mobile and web
export const getApiUrl = () => {
  // Try environment variables first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Try Vite env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Fallback to production URL (critical for mobile apps)
  return 'https://winecellar-backend.onrender.com';
};

export const API_URL = getApiUrl();


