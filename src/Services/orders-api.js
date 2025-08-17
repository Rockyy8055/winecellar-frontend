import { API_BASE } from './admin-api';

export { API_BASE };

export async function createOrder(payload) {
  const r = await fetch(new URL('/api/orders/create', API_BASE).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`createOrder failed: ${r.status}`);
  return r.json();
}

