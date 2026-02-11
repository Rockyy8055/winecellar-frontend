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

const authHeaders = (token) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const listAdminHeroSlides = async (token) => {
  const res = await fetch(`${API_BASE}/api/admin/slider/slides`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...authHeaders(token)
    },
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`listAdminHeroSlides failed: ${res.status}`);
  return res.json();
};

export const createAdminHeroSlide = async ({ file, title = '', subtitle = '', url = '', sortOrder = 0, isActive = true }, token) => {
  const form = new FormData();
  if (file) form.append('image', file);
  form.append('title', title);
  form.append('subtitle', subtitle);
  form.append('url', url);
  form.append('sortOrder', String(sortOrder || 0));
  form.append('isActive', String(Boolean(isActive)));

  const res = await fetch(`${API_BASE}/api/admin/slider/slides`, {
    method: 'POST',
    headers: {
      ...authHeaders(token)
    },
    credentials: 'include',
    body: form
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createAdminHeroSlide failed: ${res.status} ${text}`);
  }
  return res.json();
};

export const updateAdminHeroSlide = async (id, patch, token) => {
  const res = await fetch(`${API_BASE}/api/admin/slider/slides/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(token)
    },
    credentials: 'include',
    body: JSON.stringify(patch || {})
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`updateAdminHeroSlide failed: ${res.status} ${text}`);
  }
  return res.json();
};

export const deleteAdminHeroSlide = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/admin/slider/slides/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...authHeaders(token)
    },
    credentials: 'include'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`deleteAdminHeroSlide failed: ${res.status} ${text}`);
  }
  return res.json();
};
