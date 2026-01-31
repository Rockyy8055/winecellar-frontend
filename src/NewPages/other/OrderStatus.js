import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import UserAuthModal from './UserAuthModal';
import { cancelOrderByTracking, trackOrder } from '../../Services/orders-api';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const STATUS_COLORS = {
  PLACED: '#21517a',
  PROCESSING: '#7b341e',
  CONFIRMED: '#5c2f0c',
  SHIPPED: '#2b6cb0',
  OUT_FOR_DELIVERY: '#b7791f',
  DELIVERED: '#2f855a',
  CANCELLED: '#c62828'
};

const TIMELINE_STEPS = [
  { code: 'PLACED', label: 'Placed' },
  { code: 'PROCESSING', label: 'Processing' },
  { code: 'SHIPPED', label: 'Shipped' },
  { code: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { code: 'DELIVERED', label: 'Delivered' }
];

const normalizeStatus = (value) => (value || 'PROCESSING').toString().toUpperCase().replace(/\s+/g, '_');

const formatDate = (value, fallback = '') => {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (err) {
    return fallback;
  }
};

const formatCurrency = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount));
  } catch (err) {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

const deriveHistory = (rawHistory = []) => {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory.map((entry) => ({
    status: normalizeStatus(entry?.status || entry?.state),
    at: entry?.at || entry?.date || entry?.timestamp || null,
    note: entry?.note || entry?.comment || ''
  }));
};

const OrderStatus = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const trackingCode = query.get('trackingCode') || localStorage.getItem('last_tracking_code') || 'N/A';
  const [inputCode, setInputCode] = useState(trackingCode && trackingCode !== 'N/A' ? trackingCode : '');
  const [status, setStatus] = useState('PROCESSING');
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [orderedDate, setOrderedDate] = useState('');
  const [eta, setEta] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [ownerView, setOwnerView] = useState(false);
  const [statusDisplay, setStatusDisplay] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [primaryTrackingCode, setPrimaryTrackingCode] = useState(trackingCode);
  const [internalTrackingCode, setInternalTrackingCode] = useState(null);
  const [upsTrackingNumber, setUpsTrackingNumber] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);

  useEffect(() => {
    const resolved = trackingCode && trackingCode !== 'N/A' ? trackingCode : '';
    setInputCode(resolved);
    setPrimaryTrackingCode(trackingCode);
  }, [trackingCode]);

  const fetchStatus = useCallback(async () => {
    if (!trackingCode || trackingCode === 'N/A') return;
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await trackOrder(trackingCode);
      } catch (e) {
        const message = String(e?.message || '');
        if (message.includes('401')) {
          setAuthed(false);
          setShowAuth(true);
          setOwnerView(false);
          setOrder(null);
          setItems([]);
          return;
        }
        if (message.includes('403')) {
          setAuthed(true);
          setShowAuth(false);
          setOwnerView(false);
          setOrder(null);
          setItems([]);
          setError('You are signed in, but this order belongs to a different account.');
          return;
        }
        if (message.includes('404')) {
          setError('We could not find an order with that tracking reference.');
          setOwnerView(false);
          setOrder(null);
          setItems([]);
          return;
        }
        throw e;
      }

      setAuthed(true);
      setShowAuth(false);
      setOrder(data || null);

      const primary = data?.trackingCode || trackingCode;
      setPrimaryTrackingCode(primary);
      setInternalTrackingCode(data?.internalTrackingCode || null);
      setUpsTrackingNumber(data?.upsTrackingNumber || null);
      setPickupLocation(data?.pickupLocation || null);
      setStatusDisplay(data?.statusDisplay || '');
      setStatusMessage(data?.statusMessage || '');

      const resolvedStatus = normalizeStatus(data?.status);
      setStatus(resolvedStatus);

      const history = deriveHistory(
        data?.statusHistory ||
        data?.history ||
        data?.timeline ||
        data?.events ||
        []
      );
      setStatusHistory(history);

      const viewerOwnsOrder = Boolean(
        data?.isOwner ??
        data?.viewerOwnsOrder ??
        data?.ownerView ??
        (Array.isArray(data?.items) && data.items.length > 0)
      );
      setOwnerView(viewerOwnsOrder);

      setItems(Array.isArray(data?.items) ? data.items : []);
      setOrderedDate(formatDate(data?.createdAt || data?.orderDate));
      setEta(formatDate(data?.estimatedDelivery || data?.estimatedDeliveryDate || data?.eta));

      try { localStorage.setItem('last_tracking_code', primary); } catch (_) {}
    } catch (err) {
      setError('We had trouble loading that order. Please refresh or try again later.');
    } finally {
      setLoading(false);
    }
  }, [trackingCode]);

  useEffect(() => {
    if (!trackingCode || trackingCode === 'N/A') return undefined;
    fetchStatus();
    const timer = setInterval(fetchStatus, 25000);
    return () => clearInterval(timer);
  }, [fetchStatus, trackingCode]);

  useEffect(() => {
    // Check auth status for showing login CTA
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, { credentials: 'include' });
        setAuthed(res.ok);
      } catch (_) { setAuthed(false); }
    })();
  }, []);

  const cancelOrder = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrderByTracking(trackingCode);
      await fetchStatus();
    } catch (err) {
      setCancelError(err?.message || 'Unable to cancel order at this time. Please try again.');
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  const statusBadgeColor = STATUS_COLORS[status] || '#111';

  const timeline = useMemo(() => {
    const normalized = normalizeStatus(status);

    if (normalized === 'CANCELLED') {
      const cancelledEvent = statusHistory.find((entry) => entry.status === 'CANCELLED');
      return [
        {
          code: 'CANCELLED',
          label: 'Cancelled',
          completed: true,
          timestamp: cancelledEvent?.at,
          note: cancelledEvent?.note
        }
      ];
    }

    return TIMELINE_STEPS.map((step, index) => {
      const event = statusHistory.find((entry) => entry.status === step.code);
      const currentIndex = TIMELINE_STEPS.findIndex((s) => s.code === normalized);
      return {
        ...step,
        completed: currentIndex >= index,
        active: currentIndex === index,
        timestamp: event?.at || null,
        note: event?.note || ''
      };
    });
  }, [status, statusHistory]);

  const canCancel = useMemo(() => {
    const normalized = normalizeStatus(status);
    const blockList = ['CANCELLED', 'DELIVERED', 'RETURNED'];
    return ownerView && !blockList.includes(normalized);
  }, [ownerView, status]);

  const shippingAddress = order?.shippingAddress || order?.shipment?.shipTo;
  const billingAddress = order?.billingAddress || order?.billing;

  const statusLabel = useMemo(() => {
    const niceStatus = normalizeStatus(status).replace(/_/g, ' ').toLowerCase();
    return niceStatus.charAt(0).toUpperCase() + niceStatus.slice(1);
  }, [status]);

  const onSubmitTracking = (e) => {
    e.preventDefault();
    const code = String(inputCode || '').trim();
    if (!code) return;
    navigate(`/order-status?trackingCode=${encodeURIComponent(code)}`);
  };

  const upsUrl = upsTrackingNumber
    ? `https://www.ups.com/track?tracknum=${encodeURIComponent(upsTrackingNumber)}`
    : null;

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ color: '#350008', fontWeight: 800, marginBottom: 12 }}>Order Status</h1>
        <form onSubmit={onSubmitTracking} style={{ marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter UPS (1Z...) or WC-..."
            className="form-control"
            style={{ maxWidth: 420 }}
          />
          <button type="submit" className="btn btn-dark">Track</button>
        </form>
        <div style={{ background: '#fffef1', border: '1px solid #eee', borderRadius: 12, padding: 20, boxShadow: '0 10px 22px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '1.05rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div>
                <strong>Tracking Code:</strong> {primaryTrackingCode}
                {upsTrackingNumber ? (
                  <span style={{ marginLeft: 10, padding: '4px 10px', borderRadius: 999, background: '#2b6cb015', color: '#2b6cb0', fontWeight: 800, fontSize: '0.85rem' }}>
                    Carrier: UPS
                  </span>
                ) : null}
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: `${statusBadgeColor}15`, color: statusBadgeColor, fontWeight: 700, letterSpacing: 0.4 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusBadgeColor }}></span>
                {statusDisplay || statusLabel}
                {loading && <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>Updating…</span>}
              </span>
            </div>
            {statusMessage ? (
              <div style={{ color: '#5f4438', fontWeight: 600 }}>{statusMessage}</div>
            ) : null}
            {internalTrackingCode && internalTrackingCode !== primaryTrackingCode ? (
              <div style={{ fontSize: '0.95rem', color: '#6b4d53' }}>
                <strong>Internal Reference:</strong> {internalTrackingCode}
              </div>
            ) : null}
            {upsUrl ? (
              <div>
                <a href={upsUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ background: '#2b6cb0', borderColor: '#2b6cb0', fontWeight: 700 }}>
                  Track on UPS
                </a>
              </div>
            ) : null}
            {pickupLocation ? (
              <div style={{ color: '#350008', fontWeight: 700 }}>
                Please collect it at the store: {pickupLocation}
              </div>
            ) : null}
            {orderedDate && <div><strong>Order placed on:</strong> {orderedDate}</div>}
            {eta && <div><strong>Estimated delivery:</strong> {eta}</div>}
            {order?.paymentMethod && (
              <div><strong>Payment method:</strong> {order.paymentMethod}</div>
            )}
            {order?.total !== undefined && (
              <div><strong>Total charged:</strong> {formatCurrency(order.total, order?.currency || 'GBP')}</div>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 10, background: '#fdecea', color: '#c62828', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {ownerView && (
            <div style={{ marginTop: 24, display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <div style={{ padding: 16, borderRadius: 10, border: '1px solid #e4dada', background: '#ffffff' }}>
                <h5 style={{ margin: '0 0 8px', fontWeight: 800, color: '#350008' }}>Shipping to</h5>
                {shippingAddress ? (
                  <div style={{ lineHeight: 1.6 }}>
                    <div>{shippingAddress.name || order?.customer?.name}</div>
                    <div>{shippingAddress.line1 || shippingAddress.addressLine1}</div>
                    {shippingAddress.line2 && <div>{shippingAddress.line2}</div>}
                    <div>{[shippingAddress.city, shippingAddress.postcode || shippingAddress.postalCode].filter(Boolean).join(', ')}</div>
                    {shippingAddress.country && <div>{shippingAddress.country}</div>}
                    {(order?.customer?.phone || shippingAddress.phone) && <div>{order?.customer?.phone || shippingAddress.phone}</div>}
                  </div>
                ) : (
                  <div>No shipping address on file.</div>
                )}
              </div>

              <div style={{ padding: 16, borderRadius: 10, border: '1px solid #e4dada', background: '#ffffff' }}>
                <h5 style={{ margin: '0 0 8px', fontWeight: 800, color: '#350008' }}>Billing</h5>
                {billingAddress ? (
                  <div style={{ lineHeight: 1.6 }}>
                    {billingAddress.name && <div>{billingAddress.name}</div>}
                    <div>{billingAddress.line1 || billingAddress.addressLine1}</div>
                    {billingAddress.line2 && <div>{billingAddress.line2}</div>}
                    <div>{[billingAddress.city, billingAddress.postcode || billingAddress.postalCode].filter(Boolean).join(', ')}</div>
                    {billingAddress.country && <div>{billingAddress.country}</div>}
                    {billingAddress.email && <div>{billingAddress.email}</div>}
                  </div>
                ) : (
                  <div>Billing details unavailable.</div>
                )}
              </div>

              <div style={{ padding: 16, borderRadius: 10, border: '1px solid #e4dada', background: '#ffffff' }}>
                <h5 style={{ margin: '0 0 8px', fontWeight: 800, color: '#350008' }}>Order summary</h5>
                <div style={{ display: 'grid', gap: 6 }}>
                  {order?.subtotal !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal, order?.currency || 'GBP')}</span>
                    </div>
                  )}
                  {order?.shippingTotal !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shipping</span>
                      <span>{formatCurrency(order.shippingTotal, order?.currency || 'GBP')}</span>
                    </div>
                  )}
                  {order?.taxTotal !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax</span>
                      <span>{formatCurrency(order.taxTotal, order?.currency || 'GBP')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total</span>
                    <span>{formatCurrency(order?.total ?? order?.grandTotal, order?.currency || 'GBP')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ownerView && items.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontWeight: 800, color: '#350008', marginBottom: 12 }}>Items in this order</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 480 }}>
                  <thead>
                    <tr style={{ background: '#f8ece2', color: '#350008', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', borderTopLeftRadius: 10 }}>Item</th>
                      <th style={{ textAlign: 'center', padding: '12px 16px' }}>Quantity</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', borderTopRightRadius: 10 }}>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={`${item.id || item.ProductId || item.name}-${index}`} style={{ background: index % 2 === 0 ? '#fff' : '#f9f6f0' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.qty || item.quantity || 1}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency((item.qty || item.quantity || 1) * (item.price ?? item.unitPrice ?? 0), order?.currency || 'GBP')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontWeight: 800, color: '#350008', marginBottom: 16 }}>Order progress</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {timeline.map((step, index) => (
                <li key={step.code} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: step.completed ? '#350008' : '#d9c6bd',
                    color: step.completed ? '#fffef1' : '#555',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginTop: 2
                  }}>
                    {index + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: step.active ? 800 : 600, color: step.active ? '#350008' : '#5f4438', letterSpacing: 0.3 }}>
                      {step.label}
                      {step.active && status === 'CANCELLED' && ' (Current)'}
                    </div>
                    {step.timestamp && (
                      <div style={{ fontSize: '0.85rem', color: '#7d6254', marginTop: 4 }}>{formatDate(step.timestamp)}</div>
                    )}
                    {step.note && (
                      <div style={{ fontSize: '0.85rem', color: '#7d6254', marginTop: 2 }}>{step.note}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Link to={process.env.PUBLIC_URL + '/shop-grid-standard'} style={{ background: '#350008', color: '#fffef1', padding: '12px 18px', borderRadius: 7, textDecoration: 'none', fontWeight: 700 }}>
              Continue shopping
            </Link>

            {canCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                disabled={cancelling}
                style={{
                  background: '#c62828',
                  color: '#fffef1',
                  padding: '12px 18px',
                  borderRadius: 7,
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 12px rgba(198, 40, 40, 0.25)',
                  opacity: cancelling ? 0.7 : 1
                }}
              >
                Cancel order
              </button>
            )}
            {cancelError && <div style={{ color: '#c62828', fontWeight: 600 }}>{cancelError}</div>}
          </div>
        </div>

        {!authed && (
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-outline-dark" onClick={() => setShowAuth(true)}>
              Login to see full order history
            </button>
          </div>
        )}

        {confirmCancel && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => !cancelling && setConfirmCancel(false)}
          >
            <div
              style={{
                background: '#fffef1',
                padding: '24px 28px',
                borderRadius: 14,
                width: 'min(92vw, 420px)',
                boxShadow: '0 24px 40px rgba(0,0,0,0.18)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: '#350008', fontWeight: 800, marginBottom: 12 }}>Cancel this order?</h3>
              <p style={{ color: '#614736', marginBottom: 20 }}>
                This action cannot be undone. We will attempt to stop fulfilment immediately. You will receive a confirmation email if cancellation succeeds.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                  style={{ border: '1px solid #7d6254', background: '#fff', padding: '10px 16px', borderRadius: 6, fontWeight: 600, color: '#5f4438' }}
                >
                  Keep order
                </button>
                <button
                  type="button"
                  onClick={cancelOrder}
                  disabled={cancelling}
                  style={{ background: '#c62828', color: '#fffef1', padding: '10px 16px', borderRadius: 6, border: 'none', fontWeight: 700, minWidth: 130, cursor: 'pointer', opacity: cancelling ? 0.7 : 1 }}
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        <UserAuthModal show={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => window.location.reload()} />
      </div>
    </Layout>
  );
};

export default OrderStatus;

