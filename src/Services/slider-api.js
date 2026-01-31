import { API_BASE } from './admin-api';

const buildUrl = (path) => {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : undefined);
  return base ? new URL(path, base).toString() : path;
};

const jsonRequest = async (path, options = {}) => {
  const res = await fetch(buildUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`slider API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
};

export const getHeroSlides = async () => {
  return jsonRequest('/api/slider', { method: 'GET', credentials: 'omit' });
};

export const getAdminHeroSlides = async () => {
  return jsonRequest('/api/admin/slider', { method: 'GET' });
};

export const saveAdminHeroSlides = async (slides) => {
  return jsonRequest('/api/admin/slider', {
    method: 'POST',
    body: JSON.stringify({ slides })
  });
};
