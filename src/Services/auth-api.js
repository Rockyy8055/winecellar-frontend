import { API_BASE } from './admin-api';

export { API_BASE };

export function getStoredAuthToken() {
  try {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  } catch (_) {
    return '';
  }
}

export function persistAuthToken(payload) {
  const token = payload?.token || payload?.accessToken || payload?.authToken || payload?.jwt || payload?.data?.token || payload?.user?.token;
  if (!token) return;
  try {
    localStorage.setItem('token', token);
  } catch (_) {}
}

export function buildAuthHeaders(headers = {}, tokenOverride = '') {
  const token = tokenOverride || getStoredAuthToken();
  return token
    ? { ...headers, Authorization: `Bearer ${token}` }
    : headers;
}

export async function signup({ name, phone, email, password, confirmPassword }) {
  const r = await fetch(new URL('/api/auth/signup', API_BASE).toString(), {
    method: 'POST',
    headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ name, phone, email, password, confirmPassword })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || `signup failed: ${r.status}`);
  persistAuthToken(data);
  return data;
}

export async function login({ email, password }) {
  const r = await fetch(new URL('/api/auth/login', API_BASE).toString(), {
    method: 'POST',
    headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || `login failed: ${r.status}`);
  persistAuthToken(data);
  return data;
}

export async function verifyOtp({ otp, token }) {
  const r = await fetch(new URL('/api/auth/verify-otp', API_BASE).toString(), {
    method: 'POST',
    headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ otp, token })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || `verify-otp failed: ${r.status}`);
  persistAuthToken(data);
  return data;
}

export async function me() {
  const r = await fetch(new URL('/api/auth/me', API_BASE).toString(), {
    method: 'GET',
    headers: buildAuthHeaders({ Accept: 'application/json' }),
    credentials: 'include'
  });
  if (!r.ok) return null;
  return r.json();
}

export async function logout() {
  const r = await fetch(new URL('/api/auth/logout', API_BASE).toString(), {
    method: 'POST',
    headers: buildAuthHeaders({ Accept: 'application/json' }),
    credentials: 'include'
  });
  return r.ok;
}

