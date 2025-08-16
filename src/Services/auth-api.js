import { API_BASE } from './admin-api';

export { API_BASE };

export function saveUserToken(token) {
  try { localStorage.setItem('user_token', token); } catch (_) {}
}

export function getUserToken() {
  try { return localStorage.getItem('user_token') || ''; } catch (_) { return ''; }
}

export async function registerUser({ login, password, name, email, phone }) {
  const r = await fetch(new URL('/api/auth/register', API_BASE).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password, name, email, phone })
  });
  if (!r.ok) throw new Error(`register failed: ${r.status}`);
  return r.json();
}

export async function loginUser({ login, password }) {
  const r = await fetch(new URL('/api/auth/login', API_BASE).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
  if (!r.ok) throw new Error(`login failed: ${r.status}`);
  return r.json();
}

