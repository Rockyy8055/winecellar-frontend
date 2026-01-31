import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../layouts/Layout';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../Services/product-admin-api';
import { API_BASE } from '../../Services/admin-api';
import { setProducts as setProductsAction } from '../../store/slices/product-slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { resolveImageSource } from '../../utils/image';
import { getBestsellers, saveBestsellers as saveBestsellersApi } from '../../Services/bestsellers-api';
import { getAdminHeroSlides, saveAdminHeroSlides } from '../../Services/slider-api';
import defaultHeroSliderData from '../../data/hero-sliders/hero-slider-nineteen.json';

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

const createEmptySizeEntries = () => SIZE_OPTIONS.reduce((acc, size) => {
  acc[size] = [];
  return acc;
}, {});

const sumSizeEntries = (entries = []) => entries.reduce((total, entry) => {
  const num = Number(entry);
  return total + (Number.isFinite(num) && num > 0 ? num : 0);
}, 0);

const buildEntriesFromStocks = (stocks = {}) => {
  const entries = createEmptySizeEntries();
  SIZE_OPTIONS.forEach((size) => {
    const qty = Number(stocks[size]);
    if (!Number.isNaN(qty) && qty > 0) {
      entries[size] = [qty];
    }
  });
  return entries;
};

const entriesToSizeStocks = (entries = {}) => {
  const map = {};
  SIZE_OPTIONS.forEach((size) => {
    const total = sumSizeEntries(entries[size] || []);
    if (total > 0) {
      map[size] = total;
    }
  });
  return map;
};

const SIZE_CARD_STYLE = {
  border: '1px solid rgba(53,0,8,0.12)',
  borderRadius: 14,
  background: '#fffef8',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};

const SIZE_CARD_HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 700,
  color: '#350008'
};

const SIZE_CARD_LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const SIZE_CARD_ENTRY_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8
};

const SIZE_CARD_EMPTY_STYLE = {
  fontSize: '0.85rem',
  color: 'rgba(53,0,8,0.6)'
};

const BESTSELLER_MODAL_STYLE = {
  background: '#fffdf5',
  padding: 24,
  borderRadius: 26,
  width: 'min(94vw, 640px)',
  maxHeight: '85vh',
  overflow: 'hidden',
  boxShadow: '0 30px 70px rgba(20,0,6,0.25)',
  border: '1px solid rgba(80,22,3,0.08)'
};

const BESTSELLER_MODAL_HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 18
};

const BESTSELLER_SEARCH_WRAPPER = {
  position: 'relative',
  marginBottom: 18
};

const BESTSELLER_SELECTED_CARD_STYLE = {
  background: '#fffef9',
  border: '1px solid #eadfcf',
  borderRadius: 18,
  padding: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minWidth: 220,
  boxShadow: '0 8px 26px rgba(33,0,6,0.08)'
};

const BESTSELLER_SELECTED_IMAGE_STYLE = {
  width: 56,
  height: 56,
  borderRadius: 14,
  objectFit: 'cover',
  background: '#f5ebe0'
};

const BESTSELLER_SELECTED_META_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1
};

const getBestsellerRowStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '12px 14px',
  borderRadius: 18,
  border: `1px solid ${selected ? 'rgba(103,8,20,0.45)' : 'rgba(53,0,8,0.08)'}`,
  background: selected ? '#fff5ef' : '#ffffff',
  boxShadow: selected ? '0 10px 24px rgba(71,0,12,0.15)' : 'none',
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  marginBottom: 10
});

const normalizeHeroSlides = (list = []) => (
  list.map((slide, idx) => ({
    id: slide.id ?? `slide-${idx + 1}`,
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    image: slide.image || slide.imageUrl || '',
    url: slide.url || slide.href || '/shop-grid-standard'
  }))
);

const createEmptyHeroSlide = (index = 0) => ({
  id: `new-${Date.now()}-${index}`,
  title: '',
  subtitle: '',
  image: '',
  url: '/shop-grid-standard'
});

const formatCurrency = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount));
  } catch (_) {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

const AdminProducts = () => {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [showEdit, setShowEdit] = useState(null); // product to edit
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', previewUrl: '', stock: '', sizeStocks: createEmptySizeStocks(), sizeEntries: createEmptySizeEntries() });
  const [bestsellers, setBestsellers] = useState([]); // selected bestsellers (up to 6)
  const [bestsellersSearch, setBestsellersSearch] = useState('');
  const [allProductsForBestsellers, setAllProductsForBestsellers] = useState([]);
  const [showBestsellersPicker, setShowBestsellersPicker] = useState(false);
  const [heroSlides, setHeroSlides] = useState(() => normalizeHeroSlides(defaultHeroSliderData));
  const [heroSlidesLoading, setHeroSlidesLoading] = useState(true);
  const [heroSlidesSaving, setHeroSlidesSaving] = useState(false);

  const dispatch = useDispatch();
  const token = useMemo(() => { try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; } }, []);

  const newProdFileInputRef = useRef(null);
  const editFileInputsRef = useRef({});
  const productsTableRef = useRef(null);

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
      const data = await listProducts({ page, limit: opts.limit ?? 20, search: debouncedQ }, token);
      const list = data.items || data.rows || [];
      const normalizedRows = list.map((item) => {
        const sanitizedSizes = sanitizeSizeStocks(item.sizeStocks || item.stockBySize || {});
        const resolvedStock = item.stock !== undefined && item.stock !== null
          ? Number(item.stock)
          : computeTotalStock(sanitizedSizes);
        const rawImage = item.img || item.imageUrl || item.image || '';
        const preview = resolveImageSource(rawImage, item.imageUrl || item.previewUrl || rawImage);
        return {
          ...item,
          img: rawImage,
          imageUrl: item.imageUrl || rawImage,
          stock: resolvedStock,
          sizeStocks: sanitizedSizes,
          sizeEntries: buildEntriesFromStocks(sanitizedSizes),
          previewUrl: preview
        };
      });
      setRows(normalizedRows);
      if (opts.syncCatalog) {
        await syncStorefrontCatalog();
      }
    } catch (e) { console.error(e); }
  };

  const refreshPreserveScroll = async (opts = {}) => {
    const el = productsTableRef.current;
    const scrollTop = el ? el.scrollTop : 0;
    await fetchData(opts);
    requestAnimationFrame(() => {
      if (productsTableRef.current) {
        productsTableRef.current.scrollTop = scrollTop;
      }
    });
  };

  const fetchAllProductsForBestsellers = async () => {
    try {
      const data = await listProducts({ limit: 500 }, token);
      const list = data.items || data.rows || [];
      const normalized = list.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        img: item.img || item.imageUrl || '',
        previewUrl: resolveImageSource(item.img, item.imageUrl || '')
      }));
      setAllProductsForBestsellers(normalized);
    } catch (e) {
      console.error('Failed to load products for bestsellers:', e);
      toast.error('Unable to load products', TOAST_PRESET);
    }
  };

  const toggleBestseller = (product) => {
    setBestsellers(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 6) {
          toast.error('You can select up to 6 products', TOAST_PRESET);
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const saveBestsellers = async () => {
    try {
      await saveBestsellersApi(bestsellers.map(p => p.id));
      toast.success('Bestsellers saved', TOAST_PRESET);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save bestsellers', TOAST_PRESET);
    }
  };

  const loadBestsellers = async () => {
    try {
      const data = await getBestsellers();
      const list = data.items || data.products || [];
      const normalized = list.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        img: item.img || item.imageUrl || '',
        previewUrl: resolveImageSource(item.img, item.imageUrl || '')
      }));
      setBestsellers(normalized);
    } catch (e) {
      // Ignore error on load; may not exist yet
    }
  };

  const filteredBestsellersList = useMemo(() => {
    if (!bestsellersSearch) return allProductsForBestsellers;
    const q = bestsellersSearch.toLowerCase();
    return allProductsForBestsellers.filter(p => p.name.toLowerCase().includes(q));
  }, [allProductsForBestsellers, bestsellersSearch]);

  const loadHeroSlides = async () => {
    setHeroSlidesLoading(true);
    try {
      const data = await getAdminHeroSlides();
      const list = normalizeHeroSlides(data?.slides || data || []);
      setHeroSlides(list.length ? list : normalizeHeroSlides(defaultHeroSliderData));
    } catch (e) {
      console.error('Failed to load hero slides', e);
      setHeroSlides(normalizeHeroSlides(defaultHeroSliderData));
    } finally {
      setHeroSlidesLoading(false);
    }
  };

  const handleHeroSlideFieldChange = (index, field, value) => {
    setHeroSlides(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleHeroSlideImageChange = async (index, file) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setHeroSlides(prev => {
        const next = [...prev];
        next[index] = { ...next[index], image: dataUrl };
        return next;
      });
    } catch (e) {
      console.error(e);
      toast.error('Unable to process image', TOAST_PRESET);
    }
  };

  const moveHeroSlide = (index, delta) => {
    setHeroSlides(prev => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const removeHeroSlide = (index) => {
    setHeroSlides(prev => prev.filter((_, i) => i !== index));
  };

  const addHeroSlide = () => {
    setHeroSlides(prev => {
      if (prev.length >= 6) {
        toast.error('Maximum 6 slides allowed', TOAST_PRESET);
        return prev;
      }
      return [...prev, createEmptyHeroSlide(prev.length)];
    });
  };

  const saveHeroSlidesChanges = async () => {
    setHeroSlidesSaving(true);
    try {
      const cleaned = heroSlides.filter(slide => slide.image);
      await saveAdminHeroSlides(cleaned);
      toast.success('Hero slider updated', TOAST_PRESET);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to save hero slides', TOAST_PRESET);
    } finally {
      setHeroSlidesSaving(false);
    }
  };

  const renderHeroSlideCard = (slide, index) => (
    <div key={slide.id} style={{ border:'1px solid #eadfcf', borderRadius:20, padding:16, background:'#fffef9', boxShadow:'0 15px 35px rgba(33,0,6,0.08)', minWidth:260 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(53,0,8,0.6)' }}>Slide #{index + 1}</div>
          <div style={{ fontWeight:800 }}>{slide.title || 'Untitled Slide'}</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className="btn btn-sm btn-outline-secondary" disabled={index===0} onClick={()=>moveHeroSlide(index, -1)}>↑</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={index===heroSlides.length-1} onClick={()=>moveHeroSlide(index, 1)}>↓</button>
          <button className="btn btn-sm btn-outline-danger" onClick={()=>removeHeroSlide(index)}>×</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ width:140 }}>
          {slide.image ? (
            <img src={slide.image} alt={slide.title || 'Slide preview'} style={{ width:'100%', height:90, objectFit:'cover', borderRadius:12, marginBottom:8 }} />
          ) : (
            <div style={{ width:'100%', height:90, background:'#f4e8da', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#8c5c3c', marginBottom:8 }}>No image</div>
          )}
          <input type="file" accept="image/*" className="form-control form-control-sm" onChange={(e)=>handleHeroSlideImageChange(index, e.target.files?.[0] || null)} />
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <input className="form-control" placeholder="Headline" value={slide.title} onChange={(e)=>handleHeroSlideFieldChange(index, 'title', e.target.value)} />
          <textarea className="form-control" rows={2} placeholder="Subtitle" value={slide.subtitle} onChange={(e)=>handleHeroSlideFieldChange(index, 'subtitle', e.target.value)} />
          <input className="form-control" placeholder="Target URL" value={slide.url} onChange={(e)=>handleHeroSlideFieldChange(index, 'url', e.target.value)} />
        </div>
      </div>
    </div>
  );

  useEffect(() => { fetchData(); }, [page, debouncedQ]); // eslint-disable-line
  useEffect(() => { loadBestsellers(); }, []); // eslint-disable-line
  useEffect(() => { loadHeroSlides(); }, []); // eslint-disable-line

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const handleNewProductFile = async (file) => {
    if (!file) {
      setNewProd((prev) => ({ ...prev, img: '', previewUrl: '' }));
      if (newProdFileInputRef.current) newProdFileInputRef.current.value = '';
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setNewProd((prev) => ({ ...prev, img: dataUrl, previewUrl: resolveImageSource(dataUrl) }));
    } catch (err) {
      console.error(err);
      toast.error('Unable to read image file', TOAST_PRESET);
    }
  };

  const handleNewProductImageUrl = (value) => {
    if (newProdFileInputRef.current) newProdFileInputRef.current.value = '';
    const trimmed = value.trim();
    const preview = trimmed ? resolveImageSource(trimmed) : '';
    setNewProd((prev) => ({ ...prev, img: trimmed, previewUrl: preview }));
  };

  const resetNewProduct = () => {
    if (newProdFileInputRef.current) newProdFileInputRef.current.value = '';
    setNewProd({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', previewUrl: '', stock: '', sizeStocks: createEmptySizeStocks(), sizeEntries: createEmptySizeEntries() });
  };

  const onAdd = async () => {
    try {
      const sizeStocks = sanitizeSizeStocks(newProd.sizeStocks);
      const fallbackStock = computeTotalStock(sizeStocks);
      const entries = newProd.sizeEntries || createEmptySizeEntries();
      const mergedStocks = entriesToSizeStocks(entries);
      const mergedSizeStocks = Object.keys(mergedStocks).length ? mergedStocks : sizeStocks;
      const mergedStockTotal = computeTotalStock(mergedSizeStocks);
      await createProduct({
        name: newProd.name,
        price: Number(newProd.price),
        desc: newProd.desc,
        category: newProd.category ? [newProd.category] : [],
        subCategory: newProd.subCategory || '',
        img: newProd.img || '',
        stock: newProd.stock !== '' ? Number(newProd.stock || 0) : mergedStockTotal || fallbackStock,
        sizeStocks: mergedSizeStocks
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
      const entries = buildEntriesFromStocks(cleanedSizeStocks);
      await updateProduct(id, {
        name,
        price: Number(price),
        description: desc,
        img,
        category,
        subCategory,
        stock: stock !== '' && stock !== undefined ? Number(stock) : fallbackStock,
        sizeStocks: cleanedSizeStocks,
        sizeEntries: entries
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
            <input className="form-control" placeholder="Search products..." value={q} onChange={(e)=>setQ(e.target.value)} />
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
                        sizeStocks: { ...newProd.sizeStocks, [size]: e.target.value },
                        sizeEntries: {
                          ...newProd.sizeEntries,
                          [size]: e.target.value ? [Number(e.target.value)] : []
                        }
                      })}
                    />
                  </div>
                ))}
              </div>
              <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>Computed total: {computeTotalStock(newProd.sizeStocks)}</div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h6 style={{ fontWeight:800, color:'#350008', marginBottom:12 }}>Detailed Quantity Entries</h6>
              <p style={{ fontSize:'0.9rem', color:'rgba(53,0,8,0.7)', marginBottom:16 }}>Add individual stock batches per size. These will sum into the totals above.</p>
              <div className="row" style={{ gap:16 }}>
                {SIZE_OPTIONS.map((size) => {
                  const entries = newProd.sizeEntries?.[size] || [];
                  const total = sumSizeEntries(entries);
                  return (
                    <div key={`new-${size}`} className="col-12" style={{ maxWidth: '100%' }}>
                      <div style={SIZE_CARD_STYLE}>
                        <div style={SIZE_CARD_HEADER_STYLE}>
                          <span>{size}</span>
                          <span style={{ fontSize:'0.85rem', color:'rgba(53,0,8,0.7)' }}>{total} in stock</span>
                        </div>
                        <div style={SIZE_CARD_LIST_STYLE}>
                          {entries.length ? entries.map((value, idx) => (
                            <div key={`${size}-entry-${idx}`} style={SIZE_CARD_ENTRY_STYLE}>
                              <input
                                type="number"
                                min="0"
                                className="form-control form-control-sm"
                                style={{ maxWidth:120 }}
                                value={value}
                                onChange={(e)=>{
                                  const nextValue = Number(e.target.value);
                                  setNewProd((prev) => {
                                    const currentEntries = prev.sizeEntries?.[size] ? [...prev.sizeEntries[size]] : [];
                                    currentEntries[idx] = nextValue >= 0 ? nextValue : 0;
                                    return {
                                      ...prev,
                                      sizeEntries: { ...prev.sizeEntries, [size]: currentEntries },
                                      sizeStocks: { ...prev.sizeStocks, [size]: sumSizeEntries(currentEntries) }
                                    };
                                  });
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={()=>{
                                  setNewProd((prev) => {
                                    const currentEntries = prev.sizeEntries?.[size] ? [...prev.sizeEntries[size]] : [];
                                    currentEntries.splice(idx, 1);
                                    const nextEntries = currentEntries;
                                    return {
                                      ...prev,
                                      sizeEntries: { ...prev.sizeEntries, [size]: nextEntries },
                                      sizeStocks: { ...prev.sizeStocks, [size]: sumSizeEntries(nextEntries) }
                                    };
                                  });
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          )) : (
                            <div style={SIZE_CARD_EMPTY_STYLE}>No entries yet. Add the first batch below.</div>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={()=>{
                              setNewProd((prev) => {
                                const currentEntries = prev.sizeEntries?.[size] ? [...prev.sizeEntries[size]] : [];
                                currentEntries.push(0);
                                return {
                                  ...prev,
                                  sizeEntries: { ...prev.sizeEntries, [size]: currentEntries }
                                };
                              });
                            }}
                          >
                            Add batch
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mb-2"><textarea className="form-control" placeholder="Description" rows={3} value={newProd.desc} onChange={(e)=>setNewProd({ ...newProd, desc: e.target.value })} /></div>
            <button className="btn btn-dark" onClick={onAdd}>Add</button>
          </div>
          <div className="col-md-7">
            <h5>Products</h5>
            <div ref={productsTableRef} className="table-responsive" style={{ maxHeight: 500, overflow:'auto' }}>
              <table className="table table-sm">
                <thead><tr><th>Image</th><th style={{ minWidth: 180 }}>Name</th><th style={{ minWidth: 120 }}>Price</th><th>Description</th><th>Category</th><th>Stock (Total)</th><th>Sizes</th><th>Actions</th></tr></thead>
                <tbody>
                  {rows.map(p => (
                    <tr key={p.id}>
                      <td>{p.img || p.imageUrl || p.previewUrl ? <img src={resolveImageSource(p.img, p.imageUrl || p.previewUrl)} alt={p.name} style={{ width:40, height:40, objectFit:'cover' }} /> : '-'}</td>
                      <td>
                        <input
                          type="text"
                          defaultValue={p.name}
                          className="form-control form-control-sm"
                          style={{ minWidth: 180 }}
                          onBlur={(e)=>onQuickName(p.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={p.price}
                          className="form-control form-control-sm"
                          style={{ minWidth: 120 }}
                          onBlur={(e)=>onQuickPrice(p.id, e.target.value)}
                        />
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
                          <input type="number" className="form-control form-control-sm" defaultValue={p.stock||0} onBlur={async (e)=>{ try { await updateProduct(p.id, { stock: Number(e.target.value) }, token); toast.success('Stock updated', TOAST_PRESET); await refreshPreserveScroll({ syncCatalog: true }); } catch (er) { toast.error(er?.message || 'Update failed', TOAST_PRESET); console.error(er); } }} />
                          <button className="btn btn-sm btn-dark" onClick={async ()=>{ const el = document.activeElement; const value = (el && el.tagName==='INPUT') ? el.value : p.stock; try { await updateProduct(p.id, { stock: Number(value) }, token); toast.success('Stock updated', TOAST_PRESET); await refreshPreserveScroll({ syncCatalog: true }); } catch (er) { toast.error(er?.message || 'Update failed', TOAST_PRESET); console.error(er); } }}>Save</button>
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
                                        await refreshPreserveScroll({ syncCatalog: true });
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
                          const preview = resolveImageSource(p.img, p.imageUrl || p.previewUrl);
                          setShowEdit({
                            ...p,
                            category: Array.isArray(p.category) ? p.category[0] : (p.category || ''),
                            subCategory: p.subCategory || '',
                            stock: p.stock ?? '',
                            sizeStocks: normalizedSizes,
                            sizeEntries: buildEntriesFromStocks(normalizedSizes),
                            previewUrl: preview
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

        {/* Bestsellers of This Week */}
        <div className="mt-5" style={{ background:'#fffaf0', borderRadius:24, padding:24, border:'1px solid #f1e1c9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <h4 style={{ fontWeight:800, marginBottom:6 }}>Add Bestsellers of This Week</h4>
              <p style={{ margin:0, color:'rgba(53,0,8,0.65)' }}>Highlight up to six bottles that deserve the spotlight.</p>
            </div>
            <button className="btn btn-dark" onClick={() => { setShowBestsellersPicker(true); fetchAllProductsForBestsellers(); }}>Add Products</button>
          </div>
          {bestsellers.length > 0 ? (
            <>
              <div style={{ fontWeight: 700, marginTop:18, marginBottom:12, color:'#350008' }}>Selected ({bestsellers.length}/6)</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {bestsellers.map((p, idx) => (
                  <div key={p.id} style={BESTSELLER_SELECTED_CARD_STYLE}>
                    {p.previewUrl ? (
                      <img src={p.previewUrl} alt={p.name} style={BESTSELLER_SELECTED_IMAGE_STYLE} />
                    ) : (
                      <div style={{ ...BESTSELLER_SELECTED_IMAGE_STYLE, display:'flex', alignItems:'center', justifyContent:'center', color:'#8c5c3c' }}>No Img</div>
                    )}
                    <div style={BESTSELLER_SELECTED_META_STYLE}>
                      <span style={{ fontSize:12, fontWeight:700, color:'rgba(53,0,8,0.6)' }}>#{idx + 1}</span>
                      <span style={{ fontWeight:700 }}>{p.name}</span>
                      <span style={{ fontSize:13 }}>{formatCurrency(p.price)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      style={{ borderRadius:999, padding:'4px 10px', fontSize:12 }}
                      onClick={()=>toggleBestseller(p)}
                    >Remove</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
                <button className="btn btn-success" onClick={saveBestsellers}>Save Bestsellers</button>
              </div>
            </>
          ) : (
            <div style={{ marginTop:18, padding:18, border:'1px dashed rgba(53,0,8,0.3)', borderRadius:18, color:'rgba(53,0,8,0.55)' }}>
              No picks yet. Click “Add Products” to choose up to six spotlight bottles.
            </div>
          )}
        </div>

        {/* Homepage Hero Slider Manager */}
        <div className="mt-5" style={{ background:'#fef6ff', borderRadius:24, padding:24, border:'1px solid #f1dff1' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <h4 style={{ fontWeight:800, marginBottom:6 }}>Homepage Ads Slider</h4>
              <p style={{ margin:0, color:'rgba(45,0,31,0.65)' }}>Upload up to six hero images (auto-rotating banner). Drag via arrows to reorder; first slide shows first.</p>
            </div>
            <button className="btn btn-dark" onClick={addHeroSlide} disabled={heroSlides.length >= 6}>Add Slide</button>
          </div>
          <div style={{ marginTop:20 }}>
            {heroSlidesLoading ? (
              <div style={{ padding:20, textAlign:'center', color:'rgba(45,0,31,0.7)' }}>Loading current slides…</div>
            ) : (
              <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
                {heroSlides.map((slide, idx) => renderHeroSlideCard(slide, idx))}
                {!heroSlides.length && (
                  <div style={{ border:'1px dashed rgba(45,0,31,0.4)', borderRadius:20, padding:24, minWidth:260, color:'rgba(45,0,31,0.6)' }}>
                    No slides configured yet. Click “Add Slide” to begin.
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:20 }}>
            <button className="btn btn-success" disabled={heroSlidesSaving || heroSlidesLoading} onClick={saveHeroSlidesChanges}>
              {heroSlidesSaving ? 'Saving…' : 'Save Slider' }
            </button>
          </div>
        </div>

        {/* Bestsellers Picker Modal */}
        {showBestsellersPicker && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={()=>setShowBestsellersPicker(false)}>
            <div style={BESTSELLER_MODAL_STYLE} onClick={(e)=>e.stopPropagation()}>
              <div style={BESTSELLER_MODAL_HEADER_STYLE}>
                <div>
                  <h5 style={{ fontWeight:800, marginBottom:4 }}>Select Bestsellers (max 6)</h5>
                  <p style={{ margin:0, color:'rgba(53,0,8,0.65)', fontSize:14 }}>Search and tap to add or remove products. {6 - bestsellers.length} spots left.</p>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowBestsellersPicker(false)}>Close</button>
              </div>
              <div style={BESTSELLER_SEARCH_WRAPPER}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft:36, borderRadius:999, height:44, border:'1px solid #e5cdb4' }}
                  placeholder="Search products..."
                  value={bestsellersSearch}
                  onChange={(e)=>setBestsellersSearch(e.target.value)}
                />
                <span style={{ position:'absolute', left:14, top:11, color:'rgba(53,0,8,0.5)' }}>🔍</span>
              </div>
              <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight:8, paddingLeft:4 }}>
                {filteredBestsellersList.map(p => {
                  const isSelected = bestsellers.some(b => b.id === p.id);
                  return (
                    <div key={p.id} style={getBestsellerRowStyle(isSelected)} onClick={() => toggleBestseller(p)}>
                      <div style={{ width:26, height:26, borderRadius:8, border:`2px solid ${isSelected ? '#5a0a16' : '#c9b5a1'}`, display:'flex', alignItems:'center', justifyContent:'center', background:isSelected ? '#5a0a16' : '#fff', color:'#fff', fontSize:14 }}>
                        {isSelected ? '✓' : ''}
                      </div>
                      {p.previewUrl ? <img src={p.previewUrl} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 12 }} /> : <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 12 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 13, color:'rgba(53,0,8,0.7)' }}>{formatCurrency(p.price)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap:12 }}>
                <button className="btn btn-outline-secondary" style={{ borderRadius:999, padding:'10px 24px' }} onClick={()=>setShowBestsellersPicker(false)}>Cancel</button>
                <button className="btn btn-dark" style={{ borderRadius:999, padding:'10px 28px' }} onClick={()=>setShowBestsellersPicker(false)}>Done</button>
              </div>
            </div>
          </div>
        )}

        {showEdit && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={()=>setShowEdit(null)}>
            <div style={{ background:'#fffef1', padding:16, borderRadius:10, width:'min(85vw, 520px)', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e)=>e.stopPropagation()}>
              <h5>Edit Product</h5>
              <div className="row" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
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
                              setShowEdit((prev) => ({ ...prev, img: dataUrl, previewUrl: resolveImageSource(dataUrl) }));
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
                          onChange={(e)=>{
                            const next = e.target.value;
                            setShowEdit((prev) => ({ ...prev, img: next, previewUrl: next ? resolveImageSource(next) : '' }));
                          }}
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
                                const nextEntries = { ...(prev.sizeEntries || {}) };
                                if (value === '') {
                                  delete nextSizeStocks[size];
                                  nextEntries[size] = [];
                                } else {
                                  const numeric = Number(value);
                                  nextSizeStocks[size] = numeric;
                                  nextEntries[size] = [numeric];
                                }
                                const cleaned = sanitizeSizeStocks(nextSizeStocks);
                                const total = computeTotalStock(cleaned);
                                return {
                                  ...prev,
                                  sizeStocks: { ...createEmptySizeStocks(), ...nextSizeStocks },
                                  sizeEntries: { ...createEmptySizeEntries(), ...nextEntries },
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
                  <div style={{ marginBottom:24 }}>
                    <h6 style={{ fontWeight:800, color:'#350008', marginBottom:12 }}>Detailed Quantity Entries</h6>
                    <p style={{ fontSize:'0.9rem', color:'rgba(53,0,8,0.7)', marginBottom:16 }}>Manage individual stock batches per size.</p>
                    <div className="row" style={{ gap:16 }}>
                      {SIZE_OPTIONS.map((size) => {
                        const entries = showEdit.sizeEntries?.[size] || [];
                        const total = sumSizeEntries(entries);
                        return (
                          <div key={`edit-${size}`} className="col-12" style={{ maxWidth: '100%' }}>
                            <div style={SIZE_CARD_STYLE}>
                              <div style={SIZE_CARD_HEADER_STYLE}>
                                <span>{size}</span>
                                <span style={{ fontSize:'0.85rem', color:'rgba(53,0,8,0.7)' }}>{total} in stock</span>
                              </div>
                              <div style={SIZE_CARD_LIST_STYLE}>
                                {entries.length ? entries.map((value, idx) => (
                                  <div key={`${size}-edit-entry-${idx}`} style={SIZE_CARD_ENTRY_STYLE}>
                                    <input
                                      type="number"
                                      min="0"
                                      className="form-control form-control-sm"
                                      style={{ maxWidth:120 }}
                                      value={value}
                                      onChange={(e)=>{
                                        const nextValue = Number(e.target.value);
                                        setShowEdit((prev) => {
                                          const currentEntries = prev.sizeEntries?.[size] ? [...prev.sizeEntries[size]] : [];
                                          currentEntries[idx] = nextValue >= 0 ? nextValue : 0;
                                          const updatedEntries = { ...prev.sizeEntries, [size]: currentEntries };
                                          return {
                                            ...prev,
                                            sizeEntries: updatedEntries,
                                            sizeStocks: { ...prev.sizeStocks, [size]: sumSizeEntries(currentEntries) }
                                          };
                                        });
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={()=>{
                                        setShowEdit((prev) => {
                                          const currentEntries = prev.sizeEntries?.[size] ? [...prev.sizeEntries[size]] : [];
                                          currentEntries.splice(idx, 1);
                                          const nextEntries = currentEntries;
                                          return {
                                            ...prev,
                                            sizeEntries: { ...prev.sizeEntries, [size]: nextEntries },
                                            sizeStocks: { ...prev.sizeStocks, [size]: sumSizeEntries(nextEntries) }
                                          };
                                        });
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )) : (
                                  <div style={SIZE_CARD_EMPTY_STYLE}>No entries yet. Add the first batch below.</div>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={()=>{
                                    setShowEdit((prev) => {
                                      const currentEntries = prev.sizeEntries?.[size] ? [...prev.sizeEntries[size]] : [];
                                      currentEntries.push(0);
                                      return {
                                        ...prev,
                                        sizeEntries: { ...prev.sizeEntries, [size]: currentEntries }
                                      };
                                    });
                                  }}
                                >
                                  Add batch
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
