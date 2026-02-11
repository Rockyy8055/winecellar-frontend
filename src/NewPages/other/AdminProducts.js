import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../layouts/Layout';
import { listProducts, createProduct, updateProduct, deleteProduct, mapProductPayload } from '../../Services/product-admin-api';
import { API_BASE } from '../../Services/admin-api';
import { setProducts as setProductsAction } from '../../store/slices/product-slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { resolveImageSource } from '../../utils/image';
import { getBestsellers, saveBestsellers as saveBestsellersApi } from '../../Services/bestsellers-api';
import { createAdminHeroSlide, deleteAdminHeroSlide, listAdminHeroSlides, updateAdminHeroSlide } from '../../Services/slider-api';

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

const ADMIN_PAGE_STYLE = {
  paddingTop: 32,
  paddingBottom: 70,
  maxWidth: 1240,
  margin: '0 auto'
};

const SEARCH_CARD_STYLE = {
  background: '#fff9f3',
  borderRadius: 26,
  padding: '20px 28px',
  boxShadow: '0 20px 55px rgba(30,0,8,0.08)',
  border: '1px solid rgba(70,12,3,0.08)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'center',
  marginBottom: 30
};

const PANEL_WRAPPER_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'minmax(320px, 0.45fr) minmax(380px, 0.55fr)',
  gap: 28,
  alignItems: 'start'
};

const PANEL_CARD_STYLE = {
  background: '#ffffff',
  borderRadius: 30,
  padding: 28,
  border: '1px solid rgba(55,4,14,0.08)',
  boxShadow: '0 25px 70px rgba(23,0,8,0.08)'
};

const SECTION_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'rgba(32,4,9,0.6)',
  textTransform: 'uppercase',
  marginBottom: 6
};

const SLIDER_INPUT_STYLE = {
  borderRadius: 14,
  border: '1px solid rgba(93,28,4,0.2)',
  background: '#fffdfb',
  fontWeight: 600,
  padding: '10px 14px'
};

const resolveHeroSlideImage = (slide) => slide?.imageUrl || slide?.image || slide?.imagePath || slide?.url || '';

const normalizeHeroSlides = (payload) => {
  const list = payload?.slides || payload?.items || payload?.rows || payload || [];
  if (!Array.isArray(list)) return [];
  return list.map((s, idx) => ({
    id: s.id ?? s._id ?? `slide-${idx}`,
    title: s.title || '',
    subtitle: s.subtitle || '',
    url: s.url || s.href || '',
    sortOrder: Number.isFinite(Number(s.sortOrder)) ? Number(s.sortOrder) : idx,
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
    imageUrl: resolveHeroSlideImage(s)
  })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};

const INPUT_STYLE = {
  borderRadius: 14,
  border: '1px solid rgba(93,28,4,0.2)',
  background: '#fffdfb',
  fontWeight: 600,
  padding: '10px 14px'
};

const BESTSELLER_CARD_STYLE = {
  background: '#fef9ff',
  borderRadius: 30,
  padding: 28,
  border: '1px solid rgba(83,14,55,0.12)',
  boxShadow: '0 20px 65px rgba(40,0,18,0.08)',
  marginTop: 40
};

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
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showEdit, setShowEdit] = useState(null); // product to edit
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', previewUrl: '', sizeStocks: createEmptySizeStocks(), sizeEntries: createEmptySizeEntries() });
  const [bestsellers, setBestsellers] = useState([]); // selected bestsellers (up to 6)
  const [bestsellersSearch, setBestsellersSearch] = useState('');
  const [allProductsForBestsellers, setAllProductsForBestsellers] = useState([]);
  const [showBestsellersPicker, setShowBestsellersPicker] = useState(false);

  const [heroSlides, setHeroSlides] = useState([]);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroUrl, setHeroUrl] = useState('/shop-grid-standard');
  const [heroActive, setHeroActive] = useState(true);
  const [heroFile, setHeroFile] = useState(null);

  const dispatch = useDispatch();
  const token = useMemo(() => { try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; } }, []);

  const newProdFileInputRef = useRef(null);
  const heroFileInputRef = useRef(null);
  const editFileInputsRef = useRef({});
  const productsTableRef = useRef(null);
  const stockInputsRef = useRef({});
  const sizeInputsRef = useRef({});

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

  const loadHeroSlides = async () => {
    setHeroLoading(true);
    try {
      const payload = await listAdminHeroSlides(token);
      setHeroSlides(normalizeHeroSlides(payload));
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to load slider images', TOAST_PRESET);
    } finally {
      setHeroLoading(false);
    }
  };

  const resetHeroForm = () => {
    setHeroTitle('');
    setHeroSubtitle('');
    setHeroUrl('/shop-grid-standard');
    setHeroActive(true);
    setHeroFile(null);
    if (heroFileInputRef.current) heroFileInputRef.current.value = '';
  };

  const uploadHeroSlide = async () => {
    if (!heroFile) {
      toast.error('Please choose an image file to upload', TOAST_PRESET);
      return;
    }
    try {
      const maxSort = heroSlides.reduce((m, s) => Math.max(m, Number(s.sortOrder) || 0), 0);
      await createAdminHeroSlide({
        file: heroFile,
        title: heroTitle,
        subtitle: heroSubtitle,
        url: heroUrl,
        sortOrder: maxSort + 1,
        isActive: heroActive
      }, token);
      toast.success('Slider image uploaded', TOAST_PRESET);
      resetHeroForm();
      await loadHeroSlides();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Upload failed', TOAST_PRESET);
    }
  };

  const toggleHeroSlide = async (slide) => {
    try {
      await updateAdminHeroSlide(slide.id, { isActive: !slide.isActive }, token);
      setHeroSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
      toast.success('Updated', TOAST_PRESET);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Update failed', TOAST_PRESET);
    }
  };

  const deleteHeroSlide = async (slide) => {
    try {
      await deleteAdminHeroSlide(slide.id, token);
      setHeroSlides((prev) => prev.filter((s) => s.id !== slide.id));
      toast.success('Deleted', TOAST_PRESET);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Delete failed', TOAST_PRESET);
    }
  };

  const moveHeroSlide = async (slide, dir) => {
    const sorted = [...heroSlides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((s) => s.id === slide.id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    try {
      await updateAdminHeroSlide(a.id, { sortOrder: b.sortOrder }, token);
      await updateAdminHeroSlide(b.id, { sortOrder: a.sortOrder }, token);
      setHeroSlides((prev) => prev.map((s) => {
        if (s.id === a.id) return { ...s, sortOrder: b.sortOrder };
        if (s.id === b.id) return { ...s, sortOrder: a.sortOrder };
        return s;
      }).sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0)));
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Reorder failed', TOAST_PRESET);
    }
  };

  const syncStorefrontCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/product/get`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Catalog refresh failed (${res.status})`);
      const payload = await res.json();
      const catalog = Array.isArray(payload) ? payload : (payload.items || payload.rows || payload.products || payload.data || []);
      const normalizedCatalog = Array.isArray(catalog) ? catalog.map(mapProductPayload) : [];
      dispatch(setProductsAction(normalizedCatalog));
    } catch (err) {
      console.warn('Unable to update storefront catalog after admin change:', err);
    }
  };

  const normalizeRow = (item) => {
    const base = mapProductPayload(item);
    const sanitizedSizes = sanitizeSizeStocks(base.sizeStocks || item.sizeStocks || item.stockBySize || {});
    const resolvedStock = base.stock !== undefined && base.stock !== null
      ? Number(base.stock)
      : computeTotalStock(sanitizedSizes);
    const rawImage = base.img || item.img || item.imageUrl || item.image || '';
    const preview = resolveImageSource(rawImage, item.imageUrl || item.previewUrl || rawImage);
    return {
      ...item,
      ...base,
      img: rawImage,
      imageUrl: item.imageUrl || base.imageUrl || rawImage,
      stock: resolvedStock,
      sizeStocks: sanitizedSizes,
      sizeEntries: buildEntriesFromStocks(sanitizedSizes),
      previewUrl: preview
    };
  };

  const getCategoryKey = (p) => {
    const raw = Array.isArray(p?.category) ? p.category[0] : p?.category;
    return String(raw || '').toUpperCase().trim();
  };

  const getAllowedSizesForProduct = (p) => {
    const key = getCategoryKey(p);
    if (key === 'BEER') return ['35CL'];
    if (key === 'WINE') return ['75CL'];
    return SIZE_OPTIONS;
  };

  const fetchData = async (opts = {}) => {
    try {
      const selectedCategory = opts.category !== undefined ? opts.category : categoryFilter;
      const apiCategory = selectedCategory && selectedCategory !== 'ALL' ? selectedCategory : '';
      const data = await listProducts({ page, limit: opts.limit ?? 20, search: debouncedQ, category: apiCategory }, token);
      const list = data.items || data.rows || [];
      const normalizedRows = list.map(normalizeRow);
      setRows(normalizedRows);
      if (opts.syncCatalog) {
        await syncStorefrontCatalog();
      }
    } catch (e) { console.error(e); }
  };

  const handleStockSave = async (product) => {
    const rawValue = stockInputsRef.current[product.id]?.value;
    const parsed = Number(rawValue);
    const safeValue = Number.isFinite(parsed) ? parsed : Number(product.stock || 0);

    const allowedSizes = getAllowedSizesForProduct(product);

    const rawSizeRefs = sizeInputsRef.current[product.id] || {};
    const sizeValueMap = {};
    Object.entries(rawSizeRefs).forEach(([size, input]) => {
      const value = input?.value;
      if (value !== undefined && value !== null && value !== '') {
        sizeValueMap[size] = value;
      }
    });
    const cleanedSizeStocks = sanitizeSizeStocks(sizeValueMap);
    const filteredCleanedSizeStocks = allowedSizes.reduce((acc, size) => {
      if (cleanedSizeStocks[size] !== undefined) acc[size] = cleanedSizeStocks[size];
      return acc;
    }, {});
    const existingSizeStocks = sanitizeSizeStocks(product.sizeStocks || {});
    const filteredExistingSizeStocks = allowedSizes.reduce((acc, size) => {
      if (existingSizeStocks[size] !== undefined) acc[size] = existingSizeStocks[size];
      return acc;
    }, {});
    const hasSizeEntries = Object.keys(filteredCleanedSizeStocks).length > 0;
    const derivedSizeTotal = computeTotalStock(filteredCleanedSizeStocks);
    let payload;
    if (hasSizeEntries) {
      payload = { sizeStocks: filteredCleanedSizeStocks, stock: derivedSizeTotal };
    } else if (Object.keys(filteredExistingSizeStocks).length > 0) {
      payload = {
        sizeStocks: filteredExistingSizeStocks,
        stock: computeTotalStock(filteredExistingSizeStocks)
      };
    } else {
      payload = { stock: safeValue };
    }
    try {
      const updated = await updateProduct(product.id, payload, token);
      const normalized = normalizeRow(updated);
      setRows((prev) => prev.map((row) => (row.id === product.id ? normalized : row)));
      if (stockInputsRef.current[product.id]) {
        stockInputsRef.current[product.id].value = Number(normalized.stock ?? safeValue) || 0;
      }
      if (sizeInputsRef.current[product.id]) {
        const allowedSizesNext = getAllowedSizesForProduct(normalized);
        allowedSizesNext.forEach((size) => {
          const inputEl = sizeInputsRef.current[product.id][size];
          if (inputEl) {
            const nextValue = normalized.sizeStocks?.[size];
            inputEl.value = nextValue ?? '';
          }
        });
      }
      await syncStorefrontCatalog();
      toast.success('Stock updated', TOAST_PRESET);
    } catch (err) {
      toast.error(err?.message || 'Update failed', TOAST_PRESET);
      console.error(err);
    }
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

  useEffect(() => { fetchData(); }, [page, debouncedQ, categoryFilter]); // eslint-disable-line
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
    setNewProd({ name: '', price: '', desc: '', category: '', subCategory: '', img: '', previewUrl: '', sizeStocks: createEmptySizeStocks(), sizeEntries: createEmptySizeEntries() });
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
        stock: mergedStockTotal || fallbackStock,
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
      const updated = await updateProduct(id, { price: Number(value) }, token);
      const normalized = normalizeRow(updated);
      setRows((prev) => prev.map((row) => (row.id === id ? normalized : row)));
      await syncStorefrontCatalog();
      toast.success('Price updated', TOAST_PRESET);
    } catch (e) { toast.error(e?.message || 'Update failed', TOAST_PRESET); console.error(e); }
  };

  const onQuickName = async (id, value) => {
    try {
      const updated = await updateProduct(id, { name: String(value || '').trim() }, token);
      const normalized = normalizeRow(updated);
      setRows((prev) => prev.map((row) => (row.id === id ? normalized : row)));
      await syncStorefrontCatalog();
      toast.success('Name updated', TOAST_PRESET);
    } catch (e) { toast.error(e?.message || 'Update failed', TOAST_PRESET); console.error(e); }
  };

  const onQuickDesc = async (id, value) => {
    try {
      const updated = await updateProduct(id, { description: String(value || '').trim() }, token);
      const normalized = normalizeRow(updated);
      setRows((prev) => prev.map((row) => (row.id === id ? normalized : row)));
      await syncStorefrontCatalog();
      toast.success('Description updated', TOAST_PRESET);
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
      <Fragment>
        <div style={ADMIN_PAGE_STYLE}>
        <Fragment>
          <div style={{ fontSize: 13, letterSpacing: '0.08em', fontWeight: 700, color: 'rgba(53,0,8,0.6)', textTransform: 'uppercase' }}>Operations</div>
          <h1 style={{ color:'#2e050b', fontWeight:800, marginBottom: 12 }}>Admin Products</h1>
          <p style={{ color:'rgba(46,5,11,0.7)', maxWidth: 560 }}>Search, create and curate your catalogue without ever leaving this page. Use the toolkit below to keep pricing, inventory and bestsellers perfectly in sync.</p>
        </div>

        <div style={SEARCH_CARD_STYLE}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={SECTION_LABEL_STYLE}>Search products</div>
            <input className="form-control" style={INPUT_STYLE} placeholder="Type product name or SKU" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <div style={{ flex: '0 0 220px' }}>
            <div style={SECTION_LABEL_STYLE}>Filter by Category</div>
            <select
              className="form-select"
              style={{ ...INPUT_STYLE, padding: '10px 14px', fontWeight: 700 }}
              value={categoryFilter}
              onChange={(e)=>{
                setPage(1);
                setCategoryFilter(e.target.value);
              }}
            >
              {[
                'ALL','BEER','WINE','SPIRITS','VODKA','WHISKEY','TEQUILA','RUM','LIQUOR','GIN','CHAMPAGNE','BRANDY','BOURBON WHISKEY','SPIRIT','Wine'
              ].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-dark" style={{ padding:'11px 28px', borderRadius:999 }} onClick={()=>fetchData()}>Search</button>
            <button className="btn btn-outline-secondary" style={{ padding:'11px 24px', borderRadius:999 }} onClick={()=>{ setPage(1); fetchData({ limit: 5000 }); }}>Load All</button>
          </div>
        </div>

        <div style={PANEL_WRAPPER_STYLE}>
          <div style={PANEL_CARD_STYLE}>
            <div style={SECTION_LABEL_STYLE}>Add product</div>
            <h4 style={{ fontWeight:800, color:'#2d060b', marginBottom:18 }}>Catalogue entry</h4>
            <div className="mb-3"><input className="form-control" style={INPUT_STYLE} placeholder="Name" value={newProd.name} onChange={(e)=>setNewProd({ ...newProd, name: e.target.value })} /></div>
            <div className="mb-3"><input type="number" step="0.01" className="form-control" style={INPUT_STYLE} placeholder="Price" value={newProd.price} onChange={(e)=>setNewProd({ ...newProd, price: e.target.value })} /></div>
            <div className="mb-3"><input className="form-control" style={INPUT_STYLE} placeholder="Category (e.g. SPIRITS)" value={newProd.category} onChange={(e)=>setNewProd({ ...newProd, category: e.target.value })} /></div>
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
            <button className="btn btn-dark" style={{ padding:'12px 32px', borderRadius:16, fontWeight:700 }} onClick={onAdd}>Add product</button>
          </div>
          <div style={PANEL_CARD_STYLE}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={SECTION_LABEL_STYLE}>Product catalogue</div>
                <h4 style={{ fontWeight:800, margin:0 }}>Inline editor</h4>
              </div>
              <span style={{ fontSize:13, color:'rgba(32,4,9,0.6)' }}>{rows.length} items</span>
            </div>
            <div ref={productsTableRef} className="table-responsive" style={{ maxHeight: 520, overflow:'auto', borderRadius:22, border:'1px solid rgba(44,5,10,0.08)' }}>
              <table className="table table-sm" style={{ marginBottom:0 }}>
                <thead style={{ position:'sticky', top:0, zIndex:2, background:'#fff7f2', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th>Image</th>
                    <th style={{ minWidth: 190 }}>Name</th>
                    <th style={{ minWidth: 120 }}>Price</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Stock (Total)</th>
                    <th>Sizes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, idx) => (
                    <tr key={p.id} style={{ background: idx % 2 ? '#fffdf8' : '#ffffff' }}>
                      <td>{p.img || p.imageUrl || p.previewUrl ? <img src={resolveImageSource(p.img, p.imageUrl || p.previewUrl)} alt={p.name} style={{ width:44, height:44, objectFit:'cover', borderRadius:12 }} /> : '-'}</td>
                      <td>
                        <input
                          type="text"
                          defaultValue={p.name}
                          className="form-control form-control-sm"
                          style={{ minWidth: 190, ...INPUT_STYLE, fontSize:13, padding:'8px 12px' }}
                          onBlur={(e)=>onQuickName(p.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={p.price}
                          className="form-control form-control-sm"
                          style={{ minWidth: 120, ...INPUT_STYLE, fontSize:13, padding:'8px 12px' }}
                          onBlur={(e)=>onQuickPrice(p.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <textarea 
                          className="form-control form-control-sm" 
                          defaultValue={p.description || p.desc || ''} 
                          onBlur={(e) => onQuickDesc(p.id, e.target.value)}
                          style={{ minWidth: '220px', maxWidth: '320px', minHeight: '60px', ...INPUT_STYLE, fontSize:13, padding:'8px 12px' }}
                        />
                      </td>
                      <td>{Array.isArray(p.category) ? p.category.join(', ') : p.category}</td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ ...INPUT_STYLE, width: 100, padding: '8px 12px' }}
                            defaultValue={p.stock || 0}
                            ref={(el) => {
                              if (el) {
                                stockInputsRef.current[p.id] = el;
                              } else {
                                delete stockInputsRef.current[p.id];
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleStockSave(p);
                              }
                            }}
                          />
                          <button
                            className="btn btn-sm btn-dark"
                            style={{ borderRadius: 999 }}
                            onClick={() => handleStockSave(p)}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td style={{ minWidth: 220 }}>
                        <details>
                          <summary style={{ cursor:'pointer', fontWeight:600 }}>View / Edit</summary>
                          <div style={{ paddingTop:8 }}>
                            {getAllowedSizesForProduct(p).map((size) => {
                              const current = (p.sizeStocks && p.sizeStocks[size] !== undefined) ? p.sizeStocks[size] : '';
                              return (
                                <div key={size} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                                  <span style={{ width:60, fontSize:12, fontWeight:700 }}>{size}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    defaultValue={current}
                                    className="form-control form-control-sm"
                                    ref={(el) => {
                                      if (!sizeInputsRef.current[p.id]) sizeInputsRef.current[p.id] = {};
                                      if (el) {
                                        sizeInputsRef.current[p.id][size] = el;
                                      } else if (sizeInputsRef.current[p.id]) {
                                        delete sizeInputsRef.current[p.id][size];
                                      }
                                    }}
                                    onBlur={async (e) => {
                                      const value = e.target.value;
                                      const allowed = getAllowedSizesForProduct(p);
                                      const nextMap = { ...(p.sizeStocks || {}), [size]: value === '' ? undefined : Number(value) };
                                      allowed.forEach((key) => {
                                        if (nextMap[key] === undefined) return;
                                      });
                                      Object.keys(nextMap).forEach((key) => {
                                        if (!allowed.includes(key)) delete nextMap[key];
                                      });
                                      if (value === '') delete nextMap[size];
                                      const cleaned = sanitizeSizeStocks(nextMap);
                                      const stock = computeTotalStock(cleaned);
                                      try {
                                        const updated = await updateProduct(p.id, { sizeStocks: cleaned, stock }, token);
                                        const normalized = normalizeRow(updated);
                                        setRows((prev) => prev.map((row) => (row.id === p.id ? normalized : row)));
                                        await syncStorefrontCatalog();
                                        toast.success('Size stock updated', TOAST_PRESET);
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
                        <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius:999 }} onClick={()=>{
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
                            sizeStocks: normalizedSizes,
                            sizeEntries: buildEntriesFromStocks(normalizedSizes),
                            previewUrl: preview
                          });
                        }}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" style={{ borderRadius:999 }} onClick={async ()=>{
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
        <div style={BESTSELLER_CARD_STYLE}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16, alignItems:'center' }}>
            <div>
              <div style={SECTION_LABEL_STYLE}>Spotlight</div>
              <h4 style={{ fontWeight:800, marginBottom:6 }}>Bestsellers of this week</h4>
              <p style={{ margin:0, color:'rgba(48,0,19,0.65)' }}>Pick up to six bottles to headline the home page carousel.</p>
            </div>
            <button className="btn btn-dark" style={{ padding:'11px 28px', borderRadius:999 }} onClick={() => { setShowBestsellersPicker(true); fetchAllProductsForBestsellers(); }}>Add products</button>
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
                <button className="btn btn-success" style={{ padding:'11px 32px', borderRadius:16 }} onClick={saveBestsellers}>Save collection</button>
              </div>
            </>
          ) : (
            <div style={{ marginTop:18, padding:18, border:'1px dashed rgba(53,0,8,0.3)', borderRadius:18, color:'rgba(53,0,8,0.55)' }}>
              No picks yet. Click “Add products” to choose up to six spotlight bottles.
            </div>
          )}
        </div>

        {/* Bestsellers Picker Modal */}
        {showBestsellersPicker && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={()=>setShowBestsellersPicker(false)}>
            <div style={{ ...BESTSELLER_MODAL_STYLE, borderRadius:30 }} onClick={(e)=>e.stopPropagation()}>
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
                  <div className="mb-2"><label className="form-label">Stock</label><input type="number" className="form-control" value={Number(showEdit.stock || 0)} disabled /></div>
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
                      {getAllowedSizesForProduct(showEdit).map((size) => (
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
                                  stock: total
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
        </div>

        </Fragment>
        <ToastContainer position="bottom-right" />
      </Fragment>
    </Layout>
  );

};

export default AdminProducts;
