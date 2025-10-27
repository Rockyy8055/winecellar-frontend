import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../layouts/Layout';
import { listOrders, getOrder, setOrderStatus, formatGBP } from '../../Services/admin-api';
import { listProducts, createProduct, updateProduct } from '../../Services/product-admin-api';

const StatusSelect = ({ value, onChange, disabled }) => {
  const options = [
    'PLACED', 'CONFIRMED', 'PICKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  ];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="form-control">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
};

const StockEditor = ({ id, initial, onSaved }) => {
  const [value, setValue] = useState(initial ?? 0);
  const [saving, setSaving] = useState(false);
  const token = useMemo(() => { try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; } }, []);
  useEffect(()=>{ setValue(initial ?? 0); }, [initial]);
  const save = async () => {
    try { setSaving(true); await updateProduct(id, { stock: Number(value) }, token); if (onSaved) onSaved(); } catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ display:'flex', gap: 6 }}>
      <input type="number" className="form-control form-control-sm" value={value} onChange={(e)=>setValue(e.target.value)} />
      <button className="btn btn-sm btn-dark" onClick={save} disabled={saving}>{saving ? '...' : 'Save'}</button>
    </div>
  );
};

const AdminOrders = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  // products
  const [products, setProducts] = useState([]);
  const [prodQ, setProdQ] = useState("");
  const [prodQInput, setProdQInput] = useState("");
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', stock: '' });
  const [savingProd, setSavingProd] = useState(false);

  const token = useMemo(() => {
    try { return localStorage.getItem('admin_token') || localStorage.getItem('token') || ''; } catch (_) { return ''; }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodsRes] = await Promise.allSettled([
        listOrders({ page, limit: 20, status: statusFilter }, token),
        listProducts({ page: 1, limit: 50, search: prodQ }, token)
      ]);

      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value || {};
        setRows(d.items || d.rows || []);
        setCount(d.total || 0);
      } else {
        console.warn('Orders fetch failed:', ordersRes.reason);
        setRows([]);
        setCount(0);
      }

      if (prodsRes.status === 'fulfilled') {
        const p = prodsRes.value || {};
        setProducts(p.items || p.rows || p.products || []);
      } else {
        console.warn('Products fetch failed:', prodsRes.reason);
        setProducts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* initial */ }, []); // eslint-disable-line
  useEffect(() => { fetchData(); }, [page, statusFilter, prodQ]);
  useEffect(() => {
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, [page, statusFilter, prodQ]);

  const displayedProducts = React.useMemo(() => {
    const q = (prodQInput || '').trim().toLowerCase();
    if (!q) return products;
    const rank = (p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (Array.isArray(p.category) ? p.category.join(' ') : (p.category || '')).toLowerCase();
      const idxName = name.indexOf(q);
      const idxCat = cat.indexOf(q);
      let score = 1e6;
      if (idxName !== -1) score = Math.min(score, idxName);
      if (idxCat !== -1) score = Math.min(score, idxCat + 1000); // prefer name matches over category
      return score;
    };
    return [...products].sort((a, b) => rank(a) - rank(b));
  }, [products, prodQInput]);

  const view = async (id) => {
    try {
      const data = await getOrder(id, token);
      setSelected(data);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      // optimistic
      setRows((r) => r.map(x => x.id === id ? { ...x, status } : x));
      await setOrderStatus(id, status, 'Admin update', token);
      await fetchData();
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const addProduct = async () => {
    try {
      setSavingProd(true);
      await createProduct({ name: newProd.name, price: Number(newProd.price), desc: newProd.desc, category: newProd.category? [newProd.category]:[], subCategory: newProd.subCategory||'', img: newProd.img||'', stock: Number(newProd.stock||0) }, token);
      setNewProd({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', stock: '' });
      await fetchData();
    } catch (e) { console.error(e); }
    finally { setSavingProd(false); }
  };

  const quickUpdatePrice = async (id, price) => {
    try {
      await updateProduct(id, { price: Number(price) }, token);
      await fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: 24, paddingBottom: 60, fontSize: '1.1rem' }}>
        <h1 style={{ color: '#350008', fontWeight: 800, fontSize: '2.2rem' }}>Admin Orders</h1>
        <div className="row mb-3">
          <div className="col-md-3">
            <input className="form-control" placeholder="Filter status" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Tracking Code</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total (£)</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => view(r.id)} style={{ cursor: 'pointer' }}>
                  <td>{r.id}</td>
                  <td>{r.trackingCode}</td>
                  <td>{r.customer?.name}</td>
                  <td>{r.customer?.email}</td>
                  <td>{r.customer?.phone}</td>
                  <td>{formatGBP(r.total)}</td>
                  <td style={{ minWidth: 180 }} onClick={(e)=>e.stopPropagation()}>
                    <StatusSelect value={r.status} onChange={(v) => updateStatus(r.id, v)} disabled={updatingId===r.id} />
                  </td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString('en-GB') : ''}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={(e)=>{e.stopPropagation(); view(r.id);}}>View</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={9} className="text-center">{loading ? 'Loading...' : 'No orders found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View drawer/simple modal */}
        {selected && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={()=>setSelected(null)}>
            <div style={{ background:'#fffef1', maxWidth:900, width:'96%', borderRadius:10, padding:16 }} onClick={(e)=>e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ margin:0 }}>Order {selected.id}</h3>
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>setSelected(null)}>Close</button>
              </div>
              <hr/>
              <div className="row">
                <div className="col-md-6">
                  <h5>Customer</h5>
                  <div>{selected.customer?.name}</div>
                  <div>{selected.customer?.email}</div>
                  <div>{selected.customer?.phone}</div>
                </div>
                <div className="col-md-6">
                  <h5>Shipping Address</h5>
                  <div>
                    {selected.shippingAddress?.line1}<br/>
                    {selected.shippingAddress?.city} {selected.shippingAddress?.postcode}<br/>
                    {selected.shippingAddress?.country}
                  </div>
                </div>
              </div>
              <h5 className="mt-3">Items</h5>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {(selected.items||[]).map((it, idx) => (
                      <tr key={idx}><td>{it.name}</td><td>{it.qty}</td><td>{formatGBP(it.price)}</td><td>{formatGBP((it.qty||0)*(it.price||0))}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <h5>Status History</h5>
                  <ul>
                    {(selected.statusHistory||selected.history||[]).map((h,i)=> <li key={i}>{h.status} • {new Date(h.at||h.timestamp||h.date||selected.createdAt).toLocaleString('en-GB')} {h.note?`• ${h.note}`:''}</li>)}
                  </ul>
                </div>
                <div>
                  <h5>Total</h5>
                  <div style={{ fontWeight:800, fontSize:'1.2rem' }}>{formatGBP(selected.total)}</div>
                  {(selected.carrierTrackingNumber || selected.carrierTracking) && (
                    <div style={{ marginTop:6 }}>
                      Carrier Tracking: <a href={`https://www.ups.com/track?tracknum=${encodeURIComponent(selected.carrierTrackingNumber || selected.carrierTracking)}`} target="_blank" rel="noreferrer">{selected.carrierTrackingNumber || selected.carrierTracking}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Management */}
        <hr/>
        <h2 style={{ color:'#350008', fontWeight:800, fontSize: '1.8rem' }}>Products</h2>
        <div className="row">
          <div className="col-md-5">
            <h5 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add New Product</h5>
            <div className="mb-2"><input className="form-control" placeholder="Name" value={newProd.name} onChange={(e)=>setNewProd({ ...newProd, name: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Price" type="number" step="0.01" value={newProd.price} onChange={(e)=>setNewProd({ ...newProd, price: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Category" value={newProd.category} onChange={(e)=>setNewProd({ ...newProd, category: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Subcategory" value={newProd.subCategory} onChange={(e)=>setNewProd({ ...newProd, subCategory: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Image URL" value={newProd.img} onChange={(e)=>setNewProd({ ...newProd, img: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Stock" type="number" value={newProd.stock} onChange={(e)=>setNewProd({ ...newProd, stock: e.target.value })} /></div>
            <div className="mb-2"><textarea className="form-control" placeholder="Description" value={newProd.desc} onChange={(e)=>setNewProd({ ...newProd, desc: e.target.value })} /></div>
            <button className="btn btn-dark" onClick={addProduct} disabled={savingProd}>{savingProd ? 'Saving...' : 'Add Product'}</button>
          </div>
          <div className="col-md-7">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, marginBottom: 10 }}>
              <h5 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Quick Edit Prices</h5>
              <div style={{ display:'flex', gap: 8 }}>
                <input className="form-control" style={{ minWidth: 220 }} placeholder="Search products" value={prodQInput} onChange={(e)=>setProdQInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { setProdQ(prodQInput); } }} />
                <button className="btn btn-outline-dark" onClick={()=>setProdQ(prodQInput)}>Search</button>
              </div>
            </div>
            <div className="table-responsive" style={{ maxHeight: 420, overflow:'auto' }}>
              <table className="table table-sm">
                <thead style={{ fontSize: '1.05rem' }}><tr><th>Image</th><th>Name</th><th>Price</th><th>Description</th><th>Category</th><th>Stock</th><th>Update</th></tr></thead>
                <tbody>
                  {displayedProducts.map(p => (
                    <tr key={p.id}>
                      <td>{p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, objectFit:'cover' }}/> : '-'}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ minWidth: 140 }}>
                        <input type="number" step="0.01" className="form-control form-control-sm" defaultValue={p.price} onBlur={(e)=>quickUpdatePrice(p.id, e.target.value)} />
                      </td>
                      <td style={{ minWidth: 200 }}>
                        <textarea 
                          className="form-control form-control-sm" 
                          defaultValue={p.description || p.desc || ''} 
                          onBlur={async (e)=>{ try { await updateProduct(p.id, { description: e.target.value }, token); await fetchData(); } catch (er) { console.error(er); } }}
                          style={{ minHeight: '60px', fontSize: '0.9rem' }}
                        />
                      </td>
                      <td>{Array.isArray(p.category) ? p.category.join(', ') : p.category}</td>
                      <td style={{ minWidth: 120 }}>
                        <StockEditor id={p.id} initial={p.stock} onSaved={fetchData} />
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary" onClick={async ()=>{ const url = window.prompt('Paste image URL'); if (url) { await updateProduct(p.id, { img: url }, token); await fetchData(); } }}>Change Image URL</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;



