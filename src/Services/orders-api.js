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

export async function cancelOrderByTracking(trackingCode) {
  if (!trackingCode) throw new Error('trackingCode is required');

  // Try common endpoints in order; treat 200/204/409 as success (idempotent)
  const attempts = [
    {
      url: new URL(`/api/orders/cancel/${encodeURIComponent(trackingCode)}`, API_BASE).toString(),
      init: { method: 'POST', credentials: 'include' }
    },
    {
      url: new URL(`/api/orders/by-tracking/${encodeURIComponent(trackingCode)}/status`, API_BASE).toString(),
      init: {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED', note: 'Customer cancelled via Order Status page' })
      }
    },
    {
      url: new URL('/api/orders/cancel', API_BASE).toString(),
      init: {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trackingCode })
      }
    }
  ];

  let lastErrorText = '';
  for (const { url, init } of attempts) {
    try {
      const res = await fetch(url, init);
      if (res.ok || res.status === 204 || res.status === 409) {
        try { return await res.json(); } catch (_) { return { ok: true }; }
      }
      if (res.status === 404 || res.status === 405) {
        continue;
      }
      lastErrorText = await res.text();
    } catch (e) {
      lastErrorText = e?.message || String(e);
    }
  }
  throw new Error(lastErrorText || 'Unable to cancel order');
}

