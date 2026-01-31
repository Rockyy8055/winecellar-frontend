import { API_BASE } from './admin-api';

const LOCAL_KEY = 'wc_hero_slides_v1';

const buildUrl = (path) => {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : undefined);
  return base ? new URL(path, base).toString() : path;
};

export const getLocalHeroSlides = () => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const setLocalHeroSlides = (slides) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(slides || []));
  } catch (_) {
    // ignore
  }
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
  try {
    return await jsonRequest('/api/slider', { method: 'GET', credentials: 'omit' });
  } catch (e) {
    const local = getLocalHeroSlides();
    if (local) return { slides: local, source: 'local_fallback' };
    throw e;
  }
};

export const getAdminHeroSlides = async () => {
  try {
    return await jsonRequest('/api/admin/slider', { method: 'GET' });
  } catch (e) {
    const local = getLocalHeroSlides();
    if (local) return { slides: local, source: 'local_fallback' };
    throw e;
  }
};

export const saveAdminHeroSlides = async (slides) => {
  try {
    const res = await jsonRequest('/api/admin/slider', {
      method: 'POST',
      body: JSON.stringify({ slides })
    });
    setLocalHeroSlides(slides);
    return res;
  } catch (e) {
    // If CORS blocks, still persist locally so uploaded images show on this browser.
    setLocalHeroSlides(slides);
    return { ok: true, slides, source: 'local_fallback' };
  }
};
