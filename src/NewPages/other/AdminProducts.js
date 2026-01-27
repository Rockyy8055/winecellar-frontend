import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../layouts/Layout';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../Services/product-admin-api';
import { API_BASE } from '../../Services/admin-api';
import { setProducts as setProductsAction } from '../../store/slices/product-slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminProducts = () => {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [showEdit, setShowEdit] = useState(null); // product to edit
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', stock: '' });

  const dispatch = useDispatch();
  const token = useMemo(() => { try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; } }, []);

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
      setRows(data.items || data.rows || []);
      if (opts.syncCatalog) {
        await syncStorefrontCatalog();
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line

  const onAdd = async () => {
    try {
      await createProduct({
        name: newProd.name,
        price: Number(newProd.price),
        desc: newProd.desc,
        category: newProd.category ? [newProd.category] : [],
        subCategory: newProd.subCategory || '',
        img: newProd.img || '',
        stock: Number(newProd.stock || 0)
      }, token);
      setNewProd({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', stock: '' });
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
      const { id, name, desc, img, category, subCategory, stock, price } = showEdit;
      await updateProduct(id, { name, price: Number(price), description: desc, img, category, subCategory, stock: Number(stock) }, token);
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
            <div className="mb-2"><input className="form-control" placeholder="Subcategory" value={newProd.subCategory} onChange={(e)=>setNewProd({ ...newProd, subCategory: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Image URL" value={newProd.img} onChange={(e)=>setNewProd({ ...newProd, img: e.target.value })} /></div>
            <div className="mb-2"><input type="number" className="form-control" placeholder="Stock" value={newProd.stock} onChange={(e)=>setNewProd({ ...newProd, stock: e.target.value })} /></div>
            <div className="mb-2"><textarea className="form-control" placeholder="Description" rows={3} value={newProd.desc} onChange={(e)=>setNewProd({ ...newProd, desc: e.target.value })} /></div>
            <button className="btn btn-dark" onClick={onAdd}>Add</button>
          </div>
          <div className="col-md-7">
            <h5>Products</h5>
            <div className="table-responsive" style={{ maxHeight: 500, overflow:'auto' }}>
              <table className="table table-sm">
                <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Description</th><th>Category</th><th>Stock</th><th>Actions</th></tr></thead>
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
                      <td style={{ whiteSpace:'nowrap', display:'flex', gap:6 }}>
                        <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowEdit({ ...p })}>Edit</button>
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
                <div className="col-md-6 mb-2"><label className="form-label">Name</label><input className="form-control" value={showEdit.name} onChange={(e)=>setShowEdit({ ...showEdit, name: e.target.value })} /></div>
                <div className="col-md-6 mb-2"><label className="form-label">Price</label><input type="number" step="0.01" className="form-control" value={showEdit.price} onChange={(e)=>setShowEdit({ ...showEdit, price: e.target.value })} /></div>
                <div className="col-md-6 mb-2"><label className="form-label">Category</label><input className="form-control" value={Array.isArray(showEdit.category)?showEdit.category[0]:showEdit.category||''} onChange={(e)=>setShowEdit({ ...showEdit, category: e.target.value })} /></div>
                <div className="col-md-6 mb-2"><label className="form-label">Subcategory</label><input className="form-control" value={showEdit.subCategory||''} onChange={(e)=>setShowEdit({ ...showEdit, subCategory: e.target.value })} /></div>
                <div className="col-md-6 mb-2"><label className="form-label">Stock</label><input className="form-control" type="number" value={showEdit.stock||0} onChange={(e)=>setShowEdit({ ...showEdit, stock: e.target.value })} /></div>
                <div className="col-md-6 mb-2"><label className="form-label">Image URL</label><input className="form-control" value={showEdit.img || showEdit.imageUrl || ''} onChange={(e)=>setShowEdit({ ...showEdit, img: e.target.value })} /></div>
                <div className="col-12 mb-2"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={showEdit.desc || showEdit.description || ''} onChange={(e)=>setShowEdit({ ...showEdit, desc: e.target.value })} /></div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-dark" onClick={onSaveEdit}>Save</button>
                <button className="btn btn-outline-secondary" onClick={()=>setShowEdit(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} closeButton={false} hideProgressBar theme="dark" />
    </Layout>
  );
};

export default AdminProducts;



