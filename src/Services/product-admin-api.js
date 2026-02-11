import { API_BASE } from './admin-api';
import localProducts from '../assets/JesonSet/Product.json';

const SIZE_KEYS = [
  '1.5LTR',
  '1LTR',
  '75CL',
  '70CL',
  '35CL',
  '20CL',
  '10CL',
  '5CL'
];

const SIZE_CANONICAL_MAP = SIZE_KEYS.reduce((acc, key) => {
  const normalized = key.toUpperCase().replace(/\s+/g, '').replace(/\./g, '');
  acc[normalized] = key;
  return acc;
}, {});

const normalizeQuantityKey = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value)
    .toUpperCase()
    .replace(/LITRES?/g, 'LTR')
    .replace(/LITERS?/g, 'LTR')
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/\./g, '');
  return SIZE_CANONICAL_MAP[normalized] || normalized;
};

const cleanSizeStocks = (raw) => {
  if (!raw) return {};

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return cleanSizeStocks(parsed);
    } catch (_) {
      return {};
    }
  }

  if (Array.isArray(raw)) {
    const fromArray = raw.reduce((acc, entry) => {
      if (!entry || typeof entry !== 'object') return acc;
      const key = entry.key ?? entry.size ?? entry.name ?? entry.label;
      const value = entry.quantity ?? entry.qty ?? entry.stock ?? entry.value;
      if (key !== undefined && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    return cleanSizeStocks(fromArray);
  }

  if (typeof raw !== 'object') return {};

  return Object.entries(raw).reduce((acc, [key, value]) => {
    const canonical = normalizeQuantityKey(key);
    const num = Number(value);
    if (!canonical || Number.isNaN(num) || num < 0) return acc;
    acc[canonical] = num;
    return acc;
  }, {});
};

const sumSizeStocks = (map = {}) => {
  return Object.values(map).reduce((total, qty) => total + (Number.isFinite(Number(qty)) ? Number(qty) : 0), 0);
};

export const mapProductPayload = (p) => {
  const sizeStocks = cleanSizeStocks(
    p?.sizeStocks ||
    p?.stockBySize ||
    p?.inventoryBySize ||
    p?.sizeInventory ||
    p?.sizes ||
    {}
  );
  const numericStock = Number(p?.stock ?? p?.Stock);
  const resolvedStock = Number.isFinite(numericStock) ? numericStock : sumSizeStocks(sizeStocks);

  return {
    id: p.id || p._id || p.ProductId || p.productId || String(Math.random()).slice(2),
    name: p.name || p.ProductName || p.title,
    price: p.price || p.Price || p.cost || 0,
    img: p.img || p.image || p.imageUrl,
    imageUrl: p.imageUrl || p.img || p.image,
    category: p.category,
    stock: resolvedStock,
    sizeStocks,
    description: p.description || p.desc || p.Description || '',
    desc: p.desc || p.description || p.Description || ''
  };
};

function getToken(token) {
  if (token) return token;
  try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; }
}

export async function listProducts({ page = 1, limit = 20, search = '', category = '' } = {}, token) {
  // Try admin endpoint first
  try {
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
    const r = await fetch(`${API_BASE}/api/admin/products?q=${encodeURIComponent(search)}&page=${page}&limit=${limit}${categoryParam}`, {
      headers: {
        Authorization: `Bearer ${getToken(token)}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    if (r.ok) {
      const d = await r.json();
      const arr = Array.isArray(d) ? d : (d.items || d.rows || d.products || d.data || d.result || []);
      const normalized = arr.map(mapProductPayload);
      return { items: normalized, total: (d.total || normalized.length) };
    }
  } catch (_) {}
  // Fallback to public catalog
  try {
    const r2 = await fetch(`${API_BASE}/api/product/get`);
    const data = await r2.json();
    const arr = Array.isArray(data) ? data : (data.items || data.rows || data.products || data.data || []);
    const normalized = arr.map(mapProductPayload);
    return { items: normalized, total: normalized.length };
  } catch (e) {
    // Last resort: local dataset
    try {
      const arr = Array.isArray(localProducts) ? localProducts : (localProducts.items || localProducts.rows || []);
      const normalized = arr.map(mapProductPayload);
      return { items: normalized, total: normalized.length };
    } catch (_) {
      throw new Error(`listProducts failed: ${e.message}`);
    }
  }
}

export async function createProduct({ name, price, desc, category = [], subCategory = '', img = '', stock = 0, sizeStocks = {}, imageFile }, token) {
  const hasFile = imageFile instanceof File;
  const headers = { Authorization: `Bearer ${getToken(token)}` };
  let body;
  const cleanedSizeStocks = cleanSizeStocks(sizeStocks);
  const derivedStock = sumSizeStocks(cleanedSizeStocks);

  if (hasFile) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('desc', desc);
    formData.append('category', JSON.stringify(category));
    formData.append('subCategory', subCategory);
    formData.append('stock', Number.isFinite(Number(stock)) ? stock : derivedStock);
    if (Object.keys(cleanedSizeStocks).length) {
      const serialized = JSON.stringify(cleanedSizeStocks);
      formData.append('sizeStocks', serialized);
      formData.append('stockBySize', serialized);
      formData.append('inventoryBySize', serialized);
    }
    if (img) formData.append('img', img);
    formData.append('image', imageFile);
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    const payload = {
      name,
      price,
      desc,
      category,
      subCategory,
      img,
      stock: Number.isFinite(Number(stock)) ? Number(stock) : derivedStock
    };
    if (Object.keys(cleanedSizeStocks).length) {
      payload.sizeStocks = cleanedSizeStocks;
      payload.stockBySize = cleanedSizeStocks;
      payload.inventoryBySize = cleanedSizeStocks;
    }
    body = JSON.stringify(payload);
  }

  const r = await fetch(`${API_BASE}/api/product/add`, {
    method: 'POST',
    headers: {
      ...headers,
      'Accept': 'application/json'
    },
    body,
    credentials: 'include'
  });
  if (!r.ok) throw new Error(`createProduct failed: ${r.status}`);
  return r.json();
}

export async function updateProduct(id, fields = {}, token) {
  const headers = { Authorization: `Bearer ${getToken(token)}` };
  const hasFile = fields.imageFile instanceof File;
  let body;
  const cleanedSizeStocks = cleanSizeStocks(fields.sizeStocks);
  const derivedStock = Object.keys(cleanedSizeStocks).length ? sumSizeStocks(cleanedSizeStocks) : undefined;

  if (hasFile) {
    const formData = new FormData();
    if (fields.name !== undefined) formData.append('name', fields.name);
    if (fields.price !== undefined) formData.append('price', fields.price);
    if (fields.description !== undefined || fields.desc !== undefined) formData.append('desc', fields.description ?? fields.desc ?? '');
    if (fields.category !== undefined) formData.append('category', JSON.stringify(fields.category));
    if (fields.subCategory !== undefined) formData.append('subCategory', fields.subCategory);
    if (fields.stock !== undefined) {
      formData.append('stock', fields.stock);
    } else if (derivedStock !== undefined) {
      formData.append('stock', derivedStock);
    }
    if (Object.keys(cleanedSizeStocks).length) {
      const serialized = JSON.stringify(cleanedSizeStocks);
      formData.append('sizeStocks', serialized);
      formData.append('stockBySize', serialized);
      formData.append('inventoryBySize', serialized);
    }
    if (fields.img !== undefined) formData.append('img', fields.img);
    formData.append('image', fields.imageFile);
    body = formData;
  } else {
    const payload = {};
    if (fields.price !== undefined) payload.price = fields.price;
    if (fields.description !== undefined) payload.desc = fields.description; // map to desc per backend
    if (fields.desc !== undefined) payload.desc = fields.desc;
    if (fields.img !== undefined) payload.img = fields.img;
    if (fields.category !== undefined) payload.category = fields.category;
    if (fields.subCategory !== undefined) payload.subCategory = fields.subCategory;
    if (fields.stock !== undefined) {
      payload.stock = fields.stock;
    } else if (derivedStock !== undefined) {
      payload.stock = derivedStock;
    }
    if (Object.keys(cleanedSizeStocks).length) {
      payload.sizeStocks = cleanedSizeStocks;
      payload.stockBySize = cleanedSizeStocks;
      payload.inventoryBySize = cleanedSizeStocks;
    }
    if (fields.name !== undefined) payload.name = fields.name;
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const r = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Accept': 'application/json'
    },
    body,
    credentials: 'include'
  });
  if (!r.ok) {
    let message = `updateProduct failed: ${r.status}`;
    try {
      const data = await r.json();
      message = data?.message || data?.error || (Array.isArray(data?.errors) ? data.errors.join(', ') : message);
    } catch (_) { /* ignore JSON parse errors */ }
    throw new Error(message);
  }
  return r.json();
}

export async function deleteProduct(id, token) {
  const r = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken(token)}`,
      'Accept': 'application/json'
    },
    credentials: 'include'
  });
  if (!r.ok) {
    let message = `deleteProduct failed: ${r.status}`;
    try {
      const data = await r.json();
      message = data?.message || data?.error || message;
    } catch (_) {}
    throw new Error(message);
  }
  return r.json?.() || { ok: true };
}

// Image changes are sent via updateProduct with img URL



