import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../layouts/Layout';
import { listOrders, getOrder, setOrderStatus, formatGBP, API_BASE } from '../../Services/admin-api';
import { listProducts, createProduct, updateProduct } from '../../Services/product-admin-api';
import { setProducts as setProductsAction } from '../../store/slices/product-slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const EMPTY_NEW_PRODUCT = {
  name: '',
  price: '',
  desc: '',
  category: '',
  subCategory: '',
  stock: '',
  img: '',
  imageFile: null,
  previewUrl: ''
};

const TOAST_PRESET = {
  style: {
    background: '#fffef1',
    color: '#350008',
    borderRadius: 12,
    border: '1px solid #350008',
    fontWeight: 600
  },
  progressStyle: { background: '#350008' },
  iconTheme: { primary: '#350008', secondary: '#fffef1' }
};

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  // products
  const [productRows, setProductRows] = useState([]);
  const [prodQ, setProdQ] = useState("");
  const [prodQInput, setProdQInput] = useState("");
  const [newProd, setNewProd] = useState({ ...EMPTY_NEW_PRODUCT });
  const [savingProd, setSavingProd] = useState(false);
  const [editingProducts, setEditingProducts] = useState({});
  const [savingRow, setSavingRow] = useState(null);

  const fileInputsRef = useRef({});
  const blobUrlsRef = useRef(new Set());
  const newProdFileInputRef = useRef(null);
  const newProdBlobUrlRef = useRef(null);

  const reduxDispatch = useDispatch();
  const token = useMemo(() => {
    try { return localStorage.getItem('admin_token') || localStorage.getItem('token') || ''; } catch (_) { return ''; }
  }, []);

  const syncGlobalProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/product/get`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Product sync failed (${res.status})`);
      const payload = await res.json();
      const catalog = Array.isArray(payload) ? payload : (payload.items || payload.rows || payload.products || payload.data || []);
      reduxDispatch(setProductsAction(catalog));
    } catch (err) {
      console.warn('Failed to refresh storefront catalog after admin update:', err);
    }
  }, [reduxDispatch]);

  const resetNewProduct = React.useCallback(() => {
    if (newProdBlobUrlRef.current) {
      URL.revokeObjectURL(newProdBlobUrlRef.current);
      newProdBlobUrlRef.current = null;
    }
    if (newProdFileInputRef.current) {
      newProdFileInputRef.current.value = '';
    }
    setNewProd({ ...EMPTY_NEW_PRODUCT });
  }, []);

  const handleNewProductFile = (file) => {
    if (newProdBlobUrlRef.current) {
      URL.revokeObjectURL(newProdBlobUrlRef.current);
      newProdBlobUrlRef.current = null;
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      newProdBlobUrlRef.current = previewUrl;
      setNewProd((prev) => ({ ...prev, imageFile: file, previewUrl, img: '' }));
    } else {
      setNewProd((prev) => ({ ...prev, imageFile: null, previewUrl: '', img: '' }));
      if (newProdFileInputRef.current) {
        newProdFileInputRef.current.value = '';
      }
    }
  };

  const handleNewProductUrlChange = (value) => {
    if (newProdBlobUrlRef.current) {
      URL.revokeObjectURL(newProdBlobUrlRef.current);
      newProdBlobUrlRef.current = null;
    }
    if (newProdFileInputRef.current) {
      newProdFileInputRef.current.value = '';
    }
    const trimmed = value.trim();
    setNewProd((prev) => ({
      ...prev,
      img: value,
      imageFile: null,
      previewUrl: trimmed ? trimmed : '',
    }));
  };

  const page = 1;

  const fetchData = useCallback(async ({ syncCatalog = false } = {}) => {
    setLoading(true);
    try {
      const [ordersRes, prodsRes] = await Promise.allSettled([
        listOrders({ page, limit: 20, status: statusFilter }, token),
        listProducts({ page: 1, limit: 50, search: prodQ }, token)
      ]);

      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value || {};
        setRows(d.items || d.rows || []);
      } else {
        console.warn('Orders fetch failed:', ordersRes.reason);
        setRows([]);
      }

      if (prodsRes.status === 'fulfilled') {
        const p = prodsRes.value || {};
        setProductRows(p.items || p.rows || p.products || []);
        if (syncCatalog) {
          await syncGlobalProducts();
        }
      } else {
        console.warn('Products fetch failed:', prodsRes.reason);
        setProductRows([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, prodQ, statusFilter, token, syncGlobalProducts]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  const displayedProducts = React.useMemo(() => {
    const q = (prodQInput || '').trim().toLowerCase();
    if (!q) return productRows;
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
    return [...productRows].sort((a, b) => rank(a) - rank(b));
  }, [productRows, prodQInput]);

  const buildDraft = useCallback((p) => {
    const category = Array.isArray(p.category) ? p.category.filter(Boolean).join(', ') : (p.category || '');
    const base = {
      id: p.id,
      name: p.name || '',
      price: p.price ?? '',
      description: p.description || p.desc || '',
      category,
      subCategory: p.subCategory || '',
      stock: p.stock ?? '',
      img: p.img || p.imageUrl || '',
    };
    return {
      ...base,
      priceInput: base.price === '' ? '' : String(base.price),
      stockInput: base.stock === '' ? '' : String(base.stock),
      imageFile: null,
      previewUrl: base.img,
      isDirty: false,
    };
  }, []);

  useEffect(() => {
    setEditingProducts((prev) => {
      const next = {};
      const seen = new Set();
      displayedProducts.forEach((p) => {
        seen.add(p.id);
        const existing = prev[p.id];
        if (existing && existing.isDirty) {
          next[p.id] = existing;
          return;
        }
        if (existing && existing.previewUrl && blobUrlsRef.current.has(existing.previewUrl)) {
          URL.revokeObjectURL(existing.previewUrl);
          blobUrlsRef.current.delete(existing.previewUrl);
        }
        next[p.id] = buildDraft(p);
      });
      Object.keys(prev).forEach((id) => {
        if (!seen.has(id)) {
          const entry = prev[id];
          if (entry?.previewUrl && blobUrlsRef.current.has(entry.previewUrl)) {
            URL.revokeObjectURL(entry.previewUrl);
            blobUrlsRef.current.delete(entry.previewUrl);
          }
        }
      });
      return next;
    });
  }, [displayedProducts, buildDraft]);

  useEffect(() => () => {
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current.clear();
  }, []);

  useEffect(() => () => {
    if (newProdBlobUrlRef.current) {
      URL.revokeObjectURL(newProdBlobUrlRef.current);
      newProdBlobUrlRef.current = null;
    }
  }, []);

  const updateDraft = (id, updates) => {
    setEditingProducts((prev) => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], ...updates, isDirty: true } : prev[id],
    }));
  };

  const handleImageSelect = (id, file) => {
    if (!file) return;
    setEditingProducts((prev) => {
      const draft = prev[id];
      if (!draft) return prev;
      if (draft.previewUrl && blobUrlsRef.current.has(draft.previewUrl)) {
        URL.revokeObjectURL(draft.previewUrl);
        blobUrlsRef.current.delete(draft.previewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(previewUrl);
      return {
        ...prev,
        [id]: { ...draft, imageFile: file, previewUrl, img: '', isDirty: true },
      };
    });
  };

  const handleImageUrlChange = (id, value) => {
    setEditingProducts((prev) => {
      const draft = prev[id];
      if (!draft) return prev;
      if (draft.previewUrl && blobUrlsRef.current.has(draft.previewUrl)) {
        URL.revokeObjectURL(draft.previewUrl);
        blobUrlsRef.current.delete(draft.previewUrl);
      }
      const trimmed = value.trim();
      const nextPreview = trimmed ? trimmed : '';
      return {
        ...prev,
        [id]: {
          ...draft,
          img: value,
          imageFile: null,
          previewUrl: nextPreview,
          isDirty: true,
        },
      };
    });
    if (fileInputsRef.current[id]) fileInputsRef.current[id].value = '';
  };

  const serializeDraft = (draft) => {
    if (!draft) return '';
    const categoryString = draft.category
      ? draft.category.split(',').map((c) => c.trim()).filter(Boolean).join(', ')
      : '';
    return JSON.stringify({
      name: (draft.name || '').trim(),
      price: draft.priceInput === '' ? '' : String(draft.priceInput),
      description: draft.description || '',
      category: categoryString,
      subCategory: draft.subCategory || '',
      stock: draft.stockInput === '' ? '' : String(draft.stockInput),
      imageFile: draft.imageFile ? 'file' : '',
      img: (draft.imageFile ? '' : (draft.img || '').trim()),
      previewUrl: draft.imageFile ? 'file-preview' : ((draft.img || '').trim() || ''),
    });
  };

  const originalSignatures = useRef({});

  useEffect(() => {
    const next = {};
    displayedProducts.forEach((product) => {
      next[product.id] = serializeDraft(buildDraft(product));
    });
    originalSignatures.current = next;
  }, [displayedProducts, buildDraft]);

  const hasDraftChanges = (id) => {
    const draft = editingProducts[id];
    if (!draft) return false;
    const current = serializeDraft(draft);
    const original = originalSignatures.current[id];
    return current !== original;
  };

  const handleImageClear = (id) => {
    setEditingProducts((prev) => {
      const draft = prev[id];
      if (!draft) return prev;
      if (draft.previewUrl && blobUrlsRef.current.has(draft.previewUrl)) {
        URL.revokeObjectURL(draft.previewUrl);
        blobUrlsRef.current.delete(draft.previewUrl);
      }
      return {
        ...prev,
        [id]: { ...draft, imageFile: null, previewUrl: '', img: '', isDirty: true },
      };
    });
    if (fileInputsRef.current[id]) fileInputsRef.current[id].value = '';
  };

  const handleReset = (id) => {
    const product = displayedProducts.find((p) => p.id === id);
    if (!product) return;
    setEditingProducts((prev) => {
      const draft = prev[id];
      if (draft?.previewUrl && blobUrlsRef.current.has(draft.previewUrl)) {
        URL.revokeObjectURL(draft.previewUrl);
        blobUrlsRef.current.delete(draft.previewUrl);
      }
      return { ...prev, [id]: buildDraft(product) };
    });
    if (fileInputsRef.current[id]) fileInputsRef.current[id].value = '';
  };

  const handleSave = async (id) => {
    const draft = editingProducts[id];
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) { toast.error('Name is required', TOAST_PRESET); return; }
    const price = draft.priceInput === '' ? NaN : Number(draft.priceInput);
    if (Number.isNaN(price)) { toast.error('Enter a valid price', TOAST_PRESET); return; }
    const stock = draft.stockInput === '' ? NaN : Number(draft.stockInput);
    if (Number.isNaN(stock)) { toast.error('Enter valid stock', TOAST_PRESET); return; }

    const payload = {
      name,
      price,
      description: draft.description,
      category: draft.category ? draft.category.split(',').map((c) => c.trim()).filter(Boolean) : [],
      subCategory: draft.subCategory,
      stock,
    };
    if (draft.imageFile) {
      payload.imageFile = draft.imageFile;
    } else if (draft.img) {
      payload.img = draft.img;
    }

    setSavingRow(id);
    try {
      await updateProduct(id, payload, token);
      toast.success('Changes saved', TOAST_PRESET);
      setEditingProducts((prev) => {
        const draft = prev[id];
        if (!draft) return prev;
        if (draft.imageFile && draft.previewUrl && blobUrlsRef.current.has(draft.previewUrl)) {
          URL.revokeObjectURL(draft.previewUrl);
          blobUrlsRef.current.delete(draft.previewUrl);
        }
        return {
          ...prev,
          [id]: {
            ...draft,
            imageFile: null,
            previewUrl: draft.imageFile ? '' : draft.previewUrl,
            isDirty: false,
          },
        };
      });
      if (fileInputsRef.current[id]) fileInputsRef.current[id].value = '';
      await fetchData({ syncCatalog: true });
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Update failed', TOAST_PRESET);
    } finally {
      setSavingRow(null);
    }
  };

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
    const name = newProd.name.trim();
    if (!name) {
      toast.error('Name is required', TOAST_PRESET);
      return;
    }

    const price = newProd.price === '' ? NaN : Number(newProd.price);
    if (Number.isNaN(price)) {
      toast.error('Enter a valid price', TOAST_PRESET);
      return;
    }

    const stock = newProd.stock === '' ? NaN : Number(newProd.stock);
    if (Number.isNaN(stock)) {
      toast.error('Enter valid stock', TOAST_PRESET);
      return;
    }

    const payload = {
      name,
      price,
      desc: newProd.desc,
      category: newProd.category
        ? newProd.category.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
      subCategory: newProd.subCategory,
      stock,
    };

    if (newProd.imageFile) {
      payload.imageFile = newProd.imageFile;
    } else if (newProd.img) {
      payload.img = newProd.img;
    }

    setSavingProd(true);
    try {
      await createProduct(payload, token);
      toast.success('Product added', TOAST_PRESET);
      resetNewProduct();
      await fetchData({ syncCatalog: true });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to add product', TOAST_PRESET);
    } finally {
      setSavingProd(false);
    }
  };

  return (
    <>
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
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 600 }}>Product Image</label>
              <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
                {newProd.previewUrl ? (
                  <img src={newProd.previewUrl} alt={newProd.name || 'New product preview'} style={{ width: 64, height: 64, objectFit:'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width:64, height:64, borderRadius:8, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#777' }}>No image</div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={newProdFileInputRef}
                    onChange={(e)=>handleNewProductFile(e.target.files?.[0] || null)}
                    className="form-control form-control-sm"
                  />
                  {newProd.previewUrl && (
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>handleNewProductFile(null)}>Remove image</button>
                  )}
                  <input
                    className="form-control form-control-sm"
                    placeholder="Or paste image URL"
                    value={newProd.img}
                    onChange={(e)=>handleNewProductUrlChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mb-2"><input className="form-control" placeholder="Name" value={newProd.name} onChange={(e)=>setNewProd({ ...newProd, name: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Price" type="number" step="0.01" value={newProd.price} onChange={(e)=>setNewProd({ ...newProd, price: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Category (comma separated)" value={newProd.category} onChange={(e)=>setNewProd({ ...newProd, category: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Subcategory" value={newProd.subCategory} onChange={(e)=>setNewProd({ ...newProd, subCategory: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Stock" type="number" value={newProd.stock} onChange={(e)=>setNewProd({ ...newProd, stock: e.target.value })} /></div>
            <div className="mb-2"><textarea className="form-control" placeholder="Description" rows={3} value={newProd.desc} onChange={(e)=>setNewProd({ ...newProd, desc: e.target.value })} /></div>
            <button className="btn btn-dark" onClick={addProduct} disabled={savingProd}>{savingProd ? 'Saving...' : 'Add Product'}</button>
          </div>
          <div className="col-md-7">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, marginBottom: 10 }}>
              <h5 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Quick Edit Products</h5>
              <div style={{ display:'flex', gap: 8 }}>
                <input className="form-control" style={{ minWidth: 220 }} placeholder="Search products" value={prodQInput} onChange={(e)=>setProdQInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { setProdQ(prodQInput); } }} />
                <button className="btn btn-outline-dark" onClick={()=>setProdQ(prodQInput)}>Search</button>
              </div>
            </div>
            <div className="table-responsive" style={{ maxHeight: 420, overflow:'auto' }}>
              <table className="table table-sm">
                <thead style={{ fontSize: '1.05rem' }}>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price (£)</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Stock</th>
                    <th style={{ minWidth: 170 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((p) => {
                    const draft = editingProducts[p.id];
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            {draft?.previewUrl ? (
                              <img src={draft.previewUrl} alt={draft?.name || 'Product'} style={{ width: 48, height: 48, objectFit:'cover', borderRadius: 6 }} />
                            ) : (
                              <div style={{ width:48, height:48, borderRadius:6, background:'#f2f2f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#777' }}>No image</div>
                            )}
                            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                              <input
                                type="file"
                                accept="image/*"
                                ref={(el)=>{ if (el) fileInputsRef.current[p.id] = el; }}
                                onChange={(e)=>handleImageSelect(p.id, e.target.files?.[0])}
                                style={{ fontSize: '0.75rem' }}
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Or paste image URL"
                                value={draft?.img || ''}
                                onChange={(e)=>handleImageUrlChange(p.id, e.target.value)}
                              />
                              {(draft?.previewUrl || draft?.img) && (
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>handleImageClear(p.id)}>Remove image</button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: 180 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={draft?.name || ''}
                            onChange={(e)=>updateDraft(p.id, { name: e.target.value })}
                          />
                        </td>
                        <td style={{ minWidth: 120 }}>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm"
                            value={draft?.priceInput ?? ''}
                            onChange={(e)=>updateDraft(p.id, { priceInput: e.target.value })}
                          />
                        </td>
                        <td style={{ minWidth: 220 }}>
                          <textarea
                            className="form-control form-control-sm"
                            value={draft?.description || ''}
                            onChange={(e)=>updateDraft(p.id, { description: e.target.value })}
                            rows={3}
                          />
                        </td>
                        <td style={{ minWidth: 180 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={draft?.category || ''}
                            onChange={(e)=>updateDraft(p.id, { category: e.target.value })}
                            placeholder="Comma separated"
                          />
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={draft?.subCategory || ''}
                            onChange={(e)=>updateDraft(p.id, { subCategory: e.target.value })}
                          />
                        </td>
                        <td style={{ minWidth: 110 }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={draft?.stockInput ?? ''}
                            onChange={(e)=>updateDraft(p.id, { stockInput: e.target.value })}
                          />
                        </td>
                        <td>
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            <button className="btn btn-sm btn-dark" disabled={savingRow === p.id || !hasDraftChanges(p.id)} onClick={()=>handleSave(p.id)}>
                              {savingRow === p.id ? 'Saving...' : 'Save'}
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" disabled={savingRow === p.id || !draft} onClick={()=>handleReset(p.id)}>
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    <ToastContainer position="bottom-right" autoClose={2000} closeButton={false} hideProgressBar theme="dark" />
    </>
  );
}

export default AdminOrders;
