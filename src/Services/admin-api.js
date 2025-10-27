// Admin API client utilities

export const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  || process.env.REACT_APP_API_URL
  || 'https://winecellar-backend.onrender.com';

export const formatGBP = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

function getToken(defaultToken) {
  if (defaultToken) return defaultToken;
  try {
    return localStorage.getItem('admin_token') || '';
  } catch (_) {
    return '';
  }
}

export async function listOrders({ page = 1, limit = 20, status = '' } = {}, token) {
  const r = await fetch(`${API_BASE}/api/admin/orders?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${getToken(token)}` }
  });
  if (!r.ok) throw new Error(`listOrders failed: ${r.status}`);
  return r.json();
}

export async function getOrder(id, token) {
  const r = await fetch(`${API_BASE}/api/admin/orders/${id}`, {
    headers: { Authorization: `Bearer ${getToken(token)}` }
  });
  if (!r.ok) throw new Error(`getOrder failed: ${r.status}`);
  return r.json();
}

export async function setOrderStatus(id, status, note = 'Admin update', token) {
  const r = await fetch(`${API_BASE}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken(token)}` },
    body: JSON.stringify({ status, note })
  });
  if (!r.ok) throw new Error(`setOrderStatus failed: ${r.status}`);
  return r.json();
}



