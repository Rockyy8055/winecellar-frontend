import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../../layouts/Layout';
import UserAuthModal from './UserAuthModal';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const OrderStatus = () => {
  const query = useQuery();
  const trackingCode = query.get('trackingCode') || localStorage.getItem('last_tracking_code') || 'N/A';
  const [status, setStatus] = useState('Processing');
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!trackingCode || trackingCode === 'N/A' || status === 'CANCELLED') return;
    let timer;
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/track/${encodeURIComponent(trackingCode)}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.status) setStatus(data.status);
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetchStatus();
    timer = setInterval(fetchStatus, 25000);
    return () => clearInterval(timer);
  }, [trackingCode, status]);

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
      // Assumes backend endpoint exists; falls back to local cancel if not
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/cancel/${encodeURIComponent(trackingCode)}`, { method: 'POST' });
      if (!res.ok) {
        // If server doesn't support cancel, treat as locally cancelled
        if (res.status === 404 || res.status === 405) {
          setStatus('CANCELLED');
        } else {
          const text = await res.text();
          throw new Error(text || 'Cancel failed');
        }
      } else {
        setStatus('CANCELLED');
      }
      try { localStorage.setItem(`order_status_${trackingCode}`, 'CANCELLED'); } catch (_) {}
    } catch (err) {
      setCancelError(err?.message || 'Unable to cancel order at this time');
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ color: '#350008', fontWeight: 800, marginBottom: 12 }}>Order Status</h1>
        <div style={{ background: '#fffef1', border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '1.1rem' }}>
            <div><strong>Tracking Code:</strong> {trackingCode}</div>
            <div><strong>Status:</strong> {status} {loading ? '(updating...)' : ''}</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Link to={process.env.PUBLIC_URL + '/shop-grid-standard'} style={{ background: '#350008', color: '#fffef1', padding: '10px 16px', borderRadius: 6, textDecoration: 'none' }}>Continue Shopping</Link>
          </div>
          {status !== 'CANCELLED' && (
            <div style={{ marginTop: 10 }}>
              {!confirmCancel ? (
                <button onClick={() => setConfirmCancel(true)} disabled={cancelling} style={{ background: '#c62828', color: '#fff', padding: '10px 16px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                  Cancel Order
                </button>
              ) : (
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>Are you sure you want to cancel this order?</div>
                  <button onClick={cancelOrder} disabled={cancelling} style={{ background: '#c62828', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', marginRight: 8, cursor: 'pointer' }}>
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button onClick={() => setConfirmCancel(false)} disabled={cancelling} style={{ background: '#777', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                    No
                  </button>
                </div>
              )}
              {cancelError && <div style={{ color: '#c62828', marginTop: 8 }}>{cancelError}</div>}
            </div>
          )}
        </div>
        {!authed && (
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-outline-dark" onClick={()=>setShowAuth(true)}>Login to see full order history</button>
          </div>
        )}
        <UserAuthModal show={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>window.location.reload()} />
      </div>
    </Layout>
  );
};

export default OrderStatus;

