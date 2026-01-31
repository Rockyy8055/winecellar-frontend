import { API_BASE } from './admin-api';

export async function getBestsellers() {
  const r = await fetch(new URL('/api/bestsellers', API_BASE).toString(), {
    method: 'GET',
    credentials: 'include'
  });
  if (!r.ok) throw new Error(`getBestsellers failed: ${r.status}`);
  return r.json();
}

export async function saveBestsellers(productIds) {
  const r = await fetch(new URL('/api/admin/bestsellers', API_BASE).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ products: productIds })
  });
  if (!r.ok) throw new Error(`saveBestsellers failed: ${r.status}`);
  return r.json();
}
