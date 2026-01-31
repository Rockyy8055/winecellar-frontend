import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import { getMyOrders } from '../../Services/orders-api';

const normalizeOrders = (payload) => {
  if (!payload) return [];
  const list = payload.orders || payload.items || payload.rows || payload.data;
  return Array.isArray(list) ? list : [];
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-GB');
  } catch (_) {
    return '—';
  }
};

const formatCurrency = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount));
  } catch (_) {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

const MyOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await getMyOrders();
        const list = normalizeOrders(payload);
        if (!ignore) setOrders(list);
      } catch (e) {
        if (!ignore) setError(e?.message || 'Unable to load orders');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      const da = new Date(a?.createdAt || a?.orderDate || 0).getTime();
      const db = new Date(b?.createdAt || b?.orderDate || 0).getTime();
      return db - da;
    });
  }, [orders]);

  return (
    <Layout headerTop="visible">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ color: '#350008', fontWeight: 800, marginBottom: 14 }}>My Orders</h1>

        {loading ? (
          <div style={{ color: '#350008', fontWeight: 700 }}>Loading…</div>
        ) : null}

        {error ? (
          <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#fdecea', color: '#c62828', fontWeight: 600 }}>
            {error}
          </div>
        ) : null}

        {!loading && !error && sorted.length === 0 ? (
          <div style={{ marginTop: 12, color: '#5f4438', fontWeight: 600 }}>No orders found.</div>
        ) : null}

        <div style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {sorted.map((order) => {
            const trackingCode = order?.trackingCode || order?.upsTrackingNumber || order?.internalTrackingCode || order?.id;
            const internalTracking = order?.internalTrackingCode;
            const upsTracking = order?.upsTrackingNumber;
            const upsUrl = upsTracking ? `https://www.ups.com/track?tracknum=${encodeURIComponent(upsTracking)}` : null;
            const statusDisplay = order?.statusDisplay || order?.status || '—';
            const statusMessage = order?.statusMessage || '';
            const pickupLocation = order?.pickupLocation || null;
            const createdAt = formatDate(order?.createdAt || order?.orderDate);
            const total = formatCurrency(order?.total, order?.currency || 'GBP');

            return (
              <div key={order?.id || order?.orderId || trackingCode} style={{ background: '#fffef1', border: '1px solid #eee', borderRadius: 12, padding: 16, boxShadow: '0 10px 22px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800, color: '#350008' }}>Tracking: {trackingCode || '—'}</div>
                  {upsTracking ? (
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: '#2b6cb015', color: '#2b6cb0', fontWeight: 800, fontSize: '0.85rem' }}>
                      Carrier: UPS
                    </span>
                  ) : null}
                </div>

                {internalTracking && internalTracking !== trackingCode ? (
                  <div style={{ marginTop: 6, fontSize: '0.9rem', color: '#6b4d53' }}>
                    Internal Reference: {internalTracking}
                  </div>
                ) : null}

                <div style={{ marginTop: 10, display: 'grid', gap: 6, color: '#5f4438' }}>
                  <div><strong>Status:</strong> {statusDisplay}</div>
                  {statusMessage ? <div style={{ fontWeight: 600 }}>{statusMessage}</div> : null}
                  {pickupLocation ? (
                    <div style={{ color: '#350008', fontWeight: 700 }}>Please collect it at the store: {pickupLocation}</div>
                  ) : null}
                  <div><strong>Placed:</strong> {createdAt}</div>
                  <div><strong>Total:</strong> {total}</div>
                </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {trackingCode ? (
                    <Link
                      to={`/order-status?trackingCode=${encodeURIComponent(trackingCode)}`}
                      style={{ background: '#350008', color: '#fffef1', padding: '10px 14px', borderRadius: 6, display: 'inline-block', textDecoration: 'none', fontWeight: 700 }}
                    >
                      Track here
                    </Link>
                  ) : null}
                  {upsUrl ? (
                    <a
                      href={upsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: '#2b6cb0', color: '#fffef1', padding: '10px 14px', borderRadius: 6, display: 'inline-block', textDecoration: 'none', fontWeight: 700 }}
                    >
                      Track on UPS
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default MyOrders;
