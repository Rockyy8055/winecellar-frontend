import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../layouts/Layout';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../Services/product-admin-api';
import { API_BASE } from '../../Services/admin-api';
import { setProducts as setProductsAction } from '../../store/slices/product-slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SIZE_OPTIONS = ['1.5LTR', '1LTR', '75CL', '70CL', '35CL', '20CL', '10CL', '5CL'];

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
  reader.onerror = () => reject(new Error('Failed to read image file'));
  reader.readAsDataURL(file);
});

const createEmptySizeStocks = () => SIZE_OPTIONS.reduce((acc, size) => {
  acc[size] = '';
  return acc;
}, {});

const sanitizeSizeStocks = (source = {}) => {
  const cleaned = {};
  SIZE_OPTIONS.forEach((size) => {
    const raw = source[size];
    if (raw === undefined || raw === null || raw === '') return;
    const num = Number(raw);
    if (!Number.isNaN(num) && num >= 0) {
      cleaned[size] = num;
    }
  });
  return cleaned;
};

const computeTotalStock = (map = {}) => Object.values(map).reduce((sum, qty) => sum + (Number.isFinite(Number(qty)) ? Number(qty) : 0), 0);

const AdminProducts = () => {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [showEdit, setShowEdit] = useState(null); // product to edit
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', previewUrl: '', stock: '', sizeStocks: createEmptySizeStocks() });

  const dispatch = useDispatch();
  const token = useMemo(() => { try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; } }, []);

  const newProdFileInputRef = useRef(null);
  const editFileInputsRef = useRef({});

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

  const syncStorefrontCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/product/get`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Catalog refresh failed (${res.status})`);
      const payload = await res.json();
      const catalog = Array.isArray(payload) ? payload : (payload.items || payload.rows || payload.products || payload.data || []);
      dispatch(setProductsAction(catalog));
    } catch (err) {
      console.warn('Unable to update storefront catalog after admin change:', err);
    }
  };

  const fetchData = async (opts = {}) => {
    try {
      const data = await listProducts({ page, limit: opts.limit ?? 20, search: q }, token);
      const list = data.items || data.rows || [];
      const normalizedRows = list.map((item) => {
        const sanitizedSizes = sanitizeSizeStocks(item.sizeStocks || item.stockBySize || {});
        const resolvedStock = item.stock !== undefined && item.stock !== null
          ? Number(item.stock)
          : computeTotalStock(sanitizedSizes);
        return {
          ...item,
          stock: resolvedStock,
          sizeStocks: sanitizedSizes,
          previewUrl: item.img || item.imageUrl || ''
        };
      });
      setRows(normalizedRows);
      if (opts.syncCatalog) {
        await syncStorefrontCatalog();
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line

  const handleNewProductFile = async (file) => {
    if (!file) {
      setNewProd((prev) => ({ ...prev, img: '', previewUrl: '' }));
      if (newProdFileInputRef.current) newProdFileInputRef.current.value = '';
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setNewProd((prev) => ({ ...prev, img: dataUrl, previewUrl: dataUrl }));
    } catch (err) {
      console.error(err);
      toast.error('Unable to read image file', TOAST_PRESET);
    }
  };

  const handleNewProductImageUrl = (value) => {
    if (newProdFileInputRef.current) newProdFileInputRef.current.value = '';
    const trimmed = value.trim();
    setNewProd((prev) => ({ ...prev, img: trimmed, previewUrl: trimmed }));
  };

  const resetNewProduct = () => {
    if (newProdFileInputRef.current) newProdFileInputRef.current.value = '';
    setNewProd({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', previewUrl: '', stock: '', sizeStocks: createEmptySizeStocks() });
  };

  const onAdd = async () => {
    try {
      const sizeStocks = sanitizeSizeStocks(newProd.sizeStocks);
      const fallbackStock = computeTotalStock(sizeStocks);
      await createProduct({
        name: newProd.name,
        price: Number(newProd.price),
        desc: newProd.desc,
        category: newProd.category ? [newProd.category] : [],
        subCategory: newProd.subCategory || '',
        img: newProd.img || '',
        stock: newProd.stock !== '' ? Number(newProd.stock || 0) : fallbackStock,
        sizeStocks
      }, token);
      resetNewProduct();
      toast.success('Product added', TOAST_PRESET);
      await fetchData({ syncCatalog: true });
    } catch (e) {
      toast.error(e?.message || 'Failed to add product', TOAST_PRESET);
      console.error(e);
    }
  };

  const onQuickPrice = async (id, value) => {
    try {
      await updateProduct(id, { price: Number(value) }, token);
      toast.success('Price updated', TOAST_PRESET);
      await fetchData({ syncCatalog: true });
    } catch (e) { toast.error(e?.message || 'Update failed', TOAST_PRESET); console.error(e); }
  };

  const onQuickName = async (id, value) => {
    try {
      await updateProduct(id, { name: String(value || '').trim() }, token);
      toast.success('Name updated', TOAST_PRESET);
      await fetchData({ syncCatalog: true });
    } catch (e) { toast.error(e?.message || 'Update failed', TOAST_PRESET); console.error(e); }
  };

  const onQuickDesc = async (id, value) => {
    try {
      await updateProduct(id, { description: String(value || '').trim() }, token);
      toast.success('Description updated', TOAST_PRESET);
      await fetchData({ syncCatalog: true });
    } catch (e) { toast.error(e?.message || 'Update failed', TOAST_PRESET); console.error(e); }
  };

  const onSaveEdit = async () => {
    try {
      const { id, name, desc, img, category, subCategory, stock, price, sizeStocks } = showEdit;
      const cleanedSizeStocks = sanitizeSizeStocks(sizeStocks);
      const fallbackStock = computeTotalStock(cleanedSizeStocks);
      await updateProduct(id, {
        name,
        price: Number(price),
        description: desc,
        img,
        category,
        subCategory,
        stock: stock !== '' && stock !== undefined ? Number(stock) : fallbackStock,
        sizeStocks: cleanedSizeStocks
      }, token);
      setShowEdit(null);
      toast.success('Product saved', TOAST_PRESET);
      await fetchData({ syncCatalog: true });
    } catch (e) { toast.error(e?.message || 'Save failed', TOAST_PRESET); console.error(e); }
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <h1 style={{ color:'#350008', fontWeight:800 }}>Admin Products</h1>
        <div className="row mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search products" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') fetchData(); }} />
          </div>
          <div className="col-md-3" style={{ display:'flex', gap:8 }}>
            <button className="btn btn-dark" onClick={()=>fetchData()}>Search</button>
            <button className="btn btn-outline-secondary" onClick={()=>{ setPage(1); fetchData({ limit: 5000 }); }}>Load All</button>
          </div>
        </div>

        <div className="row">
          <div className="col-md-5">
            <h5>Add Product</h5>
            <div className="mb-2"><input className="form-control" placeholder="Name" value={newProd.name} onChange={(e)=>setNewProd({ ...newProd, name: e.target.value })} /></div>
            <div className="mb-2"><input type="number" step="0.01" className="form-control" placeholder="Price" value={newProd.price} onChange={(e)=>setNewProd({ ...newProd, price: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Category (e.g. SPIRITS)" value={newProd.category} onChange={(e)=>setNewProd({ ...newProd, category: e.target.value })} /></div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight:600 }}>Product Image</label>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                {newProd.previewUrl ? (
                  <img src={newProd.previewUrl} alt={newProd.name || 'Preview'} style={{ width:64, height:64, objectFit:'cover', borderRadius:8 }} />
                ) : (
                  <div style={{ width:64, height:64, borderRadius:8, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#777' }}>No image</div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm"
                    ref={newProdFileInputRef}
                    onChange={(e)=>handleNewProductFile(e.target.files?.[0] || null)}
                  />
                  {newProd.previewUrl && (
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>handleNewProductFile(null)}>Remove image</button>
                  )}
                  <input
                    className="form-control form-control-sm"
                    placeholder="Or paste image URL"
                    value={newProd.img}
                    onChange={(e)=>handleNewProductImageUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mb-2"><input className="form-control" placeholder="Subcategory" value={newProd.subCategory} onChange={(e)=>setNewProd({ ...newProd, subCategory: e.target.value })} /></div>
            <div className="mb-2"><input type="number" className="form-control" placeholder="Total Stock (auto from sizes if blank)" value={newProd.stock} onChange={(e)=>setNewProd({ ...newProd, stock: e.target.value })} /></div>
            <div className="mb-3" style={{ background:'#fff8f3', borderRadius:12, padding:12 }}>
              <div style={{ fontWeight:700, marginBottom:6 }}>Per-Size Stock</div>
              <div className="row">
                {SIZE_OPTIONS.map((size) => (
                  <div className="col-6" key={size} style={{ marginBottom:8 }}>
                    <label style={{ fontSize:12, fontWeight:600 }}>{size}</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      value={newProd.sizeStocks[size]}
                      onChange={(e)=>setNewProd({
                        ...newProd,
                        sizeStocks: { ...newProd.sizeStocks, [size]: e.target.value }
                      })}
                    />
                  </div>
                ))}
              </div>
              <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>Computed total: {computeTotalStock(newProd.sizeStocks)}</div>
            </div>
            <div className="mb-2"><textarea className="form-control" placeholder="Description" rows={3} value={newProd.desc} onChange={(e)=>setNewProd({ ...newProd, desc: e.target.value })} /></div>
            <button className="btn btn-dark" onClick={onAdd}>Add</button>
          </div>
          <div className="col-md-7">
            <h5>Products</h5>
            <div className="table-responsive" style={{ maxHeight: 500, overflow:'auto' }}>
              <table className="table table-sm">
                <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Description</th><th>Category</th><th>Stock (Total)</th><th>Sizes</th><th>Actions</th></tr></thead>
                <tbody>
                  {rows.map(p => (
                    <tr key={p.id}>
                      <td>{p.img || p.imageUrl ? <img src={p.img || p.imageUrl} alt={p.name} style={{ width:40, height:40, objectFit:'cover' }} /> : '-'}</td>
                      <td>
                        <input
                          type="text"
                          defaultValue={p.name}
                          className="form-control form-control-sm"
                          onBlur={(e)=>onQuickName(p.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <input type="number" step="0.01" defaultValue={p.price} className="form-control form-control-sm" onBlur={(e)=>onQuickPrice(p.id, e.target.value)} />
                      </td>
                      <td>
                        <textarea 
                          className="form-control form-control-sm" 
                          defaultValue={p.description || p.desc || ''} 
                          onBlur={(e) => onQuickDesc(p.id, e.target.value)}
                          style={{ minWidth: '200px', maxWidth: '300px', minHeight: '60px' }}
                        />
                      </td>
                      <td>{Array.isArray(p.category) ? p.category.join(', ') : p.category}</td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <input type="number" className="form-control form-control-sm" defaultValue={p.stock||0} onBlur={async (e)=>{ try { await updateProduct(p.id, { stock: Number(e.target.value) }, token); toast.success('Stock updated', TOAST_PRESET); await fetchData({ syncCatalog: true }); } catch (er) { toast.error(er?.message || 'Update failed', TOAST_PRESET); console.error(er); } }} />
                          <button className="btn btn-sm btn-dark" onClick={async ()=>{ const el = document.activeElement; const value = (el && el.tagName==='INPUT') ? el.value : p.stock; try { await updateProduct(p.id, { stock: Number(value) }, token); toast.success('Stock updated', TOAST_PRESET); await fetchData({ syncCatalog: true }); } catch (er) { toast.error(er?.message || 'Update failed', TOAST_PRESET); console.error(er); } }}>Save</button>
                        </div>
                      </td>
                      <td style={{ minWidth: 220 }}>
                        <details>
                          <summary style={{ cursor:'pointer', fontWeight:600 }}>View / Edit</summary>
                          <div style={{ paddingTop:8 }}>
                            {SIZE_OPTIONS.map((size) => {
                              const current = (p.sizeStocks && p.sizeStocks[size] !== undefined) ? p.sizeStocks[size] : '';
                              return (
                                <div key={size} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                                  <span style={{ width:60, fontSize:12, fontWeight:700 }}>{size}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    defaultValue={current}
                                    className="form-control form-control-sm"
                                    onBlur={async (e) => {
                                      const value = e.target.value;
                                      const payload = { sizeStocks: { ...(p.sizeStocks || {}), [size]: value === '' ? undefined : Number(value) } };
                                      if (value === '') delete payload.sizeStocks[size];
                                      const cleaned = sanitizeSizeStocks(payload.sizeStocks);
                                      const stock = computeTotalStock(cleaned);
                                      try {
                                        await updateProduct(p.id, { sizeStocks: cleaned, stock }, token);
                                        toast.success('Size stock updated', TOAST_PRESET);
                                        await fetchData({ syncCatalog: true });
                                      } catch (er) {
                                        toast.error(er?.message || 'Update failed', TOAST_PRESET);
                                        console.error(er);
                                      }
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      </td>
                      <td style={{ whiteSpace:'nowrap', display:'flex', gap:6 }}>
                        <button className="btn btn-sm btn-outline-secondary" onClick={()=>{
                          const normalizedSizes = { ...createEmptySizeStocks() };
                          const cleaned = sanitizeSizeStocks(p.sizeStocks || {});
                          Object.entries(cleaned).forEach(([key, value]) => {
                            normalizedSizes[key] = value;
                          });
                          setShowEdit({
                            ...p,
                            category: Array.isArray(p.category) ? p.category[0] : (p.category || ''),
                            subCategory: p.subCategory || '',
                            stock: p.stock ?? '',
                            sizeStocks: normalizedSizes,
                            previewUrl: p.img || p.imageUrl || ''
                          });
                        }}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={async ()=>{
                          try {
                            await deleteProduct(p.id, token);
                            toast.success('Product deleted', TOAST_PRESET);
                            await fetchData({ syncCatalog: true });
                          } catch(e){ toast.error(e?.message||'Delete failed', TOAST_PRESET); }
                        }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showEdit && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={()=>setShowEdit(null)}>
            <div style={{ background:'#fffef1', padding:16, borderRadius:10, width:'min(92vw, 640px)' }} onClick={(e)=>e.stopPropagation()}>
              <h5>Edit Product</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2"><label className="form-label">Name</label><input className="form-control" value={showEdit.name||''} onChange={(e)=>setShowEdit({ ...showEdit, name: e.target.value })} /></div>
                  <div className="mb-2"><label className="form-label">Price</label><input type="number" className="form-control" value={showEdit.price||0} onChange={(e)=>setShowEdit({ ...showEdit, price: e.target.value })} /></div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2"><label className="form-label">Category</label><input className="form-control" value={Array.isArray(showEdit.category)?showEdit.category[0]:showEdit.category||''} onChange={(e)=>setShowEdit({ ...showEdit, category: e.target.value })} /></div>
                  <div className="mb-2"><label className="form-label">Subcategory</label><input className="form-control" value={showEdit.subCategory||''} onChange={(e)=>setShowEdit({ ...showEdit, subCategory: e.target.value })} /></div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2"><label className="form-label">Stock</label><input type="number" className="form-control" value={showEdit.stock||0} onChange={(e)=>setShowEdit({ ...showEdit, stock: e.target.value })} /></div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight:600 }}>Product Image</label>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      {showEdit.previewUrl ? (
                        <img src={showEdit.previewUrl} alt={showEdit.name || 'Preview'} style={{ width:64, height:64, objectFit:'cover', borderRadius:8 }} />
                      ) : (
                        <div style={{ width:64, height:64, borderRadius:8, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#777' }}>No image</div>
                      )}
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm"
                          ref={(el)=>{ if (el && showEdit?.id) editFileInputsRef.current[showEdit.id] = el; }}
                          onChange={async (e)=>{
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const dataUrl = await fileToDataUrl(file);
                              setShowEdit((prev) => ({ ...prev, img: dataUrl, previewUrl: dataUrl }));
                            } catch (err) {
                              console.error(err);
                              toast.error('Unable to read image file', TOAST_PRESET);
                            }
                          }}
                        />
                        {showEdit.previewUrl && (
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>{
                            if (showEdit?.id && editFileInputsRef.current[showEdit.id]) editFileInputsRef.current[showEdit.id].value = '';
                            setShowEdit((prev) => ({ ...prev, img: '', previewUrl: '' }));
                          }}>Remove image</button>
                        )}
                        <input
                          className="form-control form-control-sm"
                          placeholder="Or paste image URL"
                          value={showEdit.img || ''}
                          onChange={(e)=>setShowEdit((prev) => ({ ...prev, img: e.target.value, previewUrl: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3" style={{ background:'#fff8f3', borderRadius:12, padding:12 }}>
                    <div style={{ fontWeight:700, marginBottom:6 }}>Per-Size Stock</div>
                    <div className="row">
                      {SIZE_OPTIONS.map((size) => (
                        <div className="col-6" key={size} style={{ marginBottom:8 }}>
                          <label style={{ fontSize:12, fontWeight:600 }}>{size}</label>
                          <input
                            type="number"
                            min="0"
                            className="form-control form-control-sm"
                            value={(showEdit.sizeStocks && showEdit.sizeStocks[size] !== undefined) ? showEdit.sizeStocks[size] : ''}
                            onChange={(e)=>{
                              const value = e.target.value;
                              setShowEdit((prev) => {
                                const nextSizeStocks = { ...(prev.sizeStocks || {}) };
                                if (value === '') {
                                  delete nextSizeStocks[size];
                                } else {
                                  nextSizeStocks[size] = value;
                                }
                                const cleaned = sanitizeSizeStocks(nextSizeStocks);
                                const total = computeTotalStock(cleaned);
                                return {
                                  ...prev,
                                  sizeStocks: { ...createEmptySizeStocks(), ...nextSizeStocks },
                                  stock: prev.stock === '' || prev.stock === null || prev.stock === undefined ? total : prev.stock
                                };
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>Computed total: {computeTotalStock(showEdit.sizeStocks)}</div>
                  </div>
                </div>
              </div>
              <div className="mb-2"><label className="form-label">Image URL</label><input className="form-control" value={showEdit.img||''} onChange={(e)=>setShowEdit({ ...showEdit, img: e.target.value, previewUrl: e.target.value })} /></div>
              <div className="mb-2"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={showEdit.desc||''} onChange={(e)=>setShowEdit({ ...showEdit, desc: e.target.value })} /></div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button className="btn btn-dark" onClick={onSaveEdit}>Save</button>
                <button className="btn btn-outline-secondary" onClick={()=>setShowEdit(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-center" autoClose={1800} hideProgressBar theme="light" newestOnTop limit={2} />
    </Layout>
  );

};

export default AdminProducts;
