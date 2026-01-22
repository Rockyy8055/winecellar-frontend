import { API_BASE } from './admin-api';
import localProducts from '../assets/JesonSet/Product.json';

function getToken(token) {
  if (token) return token;
  try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; }
}

export async function listProducts({ page = 1, limit = 20, search = '' } = {}, token) {
  // Try admin endpoint first
  try {
    const r = await fetch(`${API_BASE}/api/admin/products?q=${encodeURIComponent(search)}&page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${getToken(token)}` }
    });
    if (r.ok) {
      const d = await r.json();
      const arr = Array.isArray(d) ? d : (d.items || d.rows || d.products || d.data || d.result || []);
      const normalized = arr.map((p) => ({
        id: p.id || p._id || p.ProductId || p.productId || String(Math.random()).slice(2),
        name: p.name || p.ProductName || p.title,
        price: p.price || p.Price || p.cost || 0,
        img: p.img || p.image || p.imageUrl,
        imageUrl: p.imageUrl || p.img || p.image,
        category: p.category,
        stock: p.stock,
        description: p.description || p.desc || p.Description || '',
        desc: p.desc || p.description || p.Description || ''
      }));
      return { items: normalized, total: (d.total || normalized.length) };
    }
  } catch (_) {}
  // Fallback to public catalog
  try {
    const r2 = await fetch(`${API_BASE}/api/product/get`);
    const data = await r2.json();
    const arr = Array.isArray(data) ? data : (data.items || data.rows || data.products || data.data || []);
    const normalized = arr.map((p) => ({
      id: p.id || p._id || p.ProductId || p.productId || String(Math.random()).slice(2),
      name: p.name || p.ProductName || p.title,
      price: p.price || p.Price || p.cost || 0,
      img: p.img || p.image || p.imageUrl,
      imageUrl: p.imageUrl || p.img || p.image,
      category: p.category,
      stock: p.stock,
      description: p.description || p.desc || p.Description || '',
      desc: p.desc || p.description || p.Description || ''
    }));
    return { items: normalized, total: normalized.length };
  } catch (e) {
    // Last resort: local dataset
    try {
      const arr = Array.isArray(localProducts) ? localProducts : (localProducts.items || localProducts.rows || []);
      const normalized = arr.map((p) => ({
        id: p.ProductId || p.id || p._id || String(Math.random()).slice(2),
        name: p.ProductName || p.name || p.title,
        price: p.Price || p.price || 0,
        img: p.img || p.image || p.imageUrl || p.ImageUrl,
        imageUrl: p.imageUrl || p.img || p.image || p.ImageUrl,
        category: p.category || p.Category,
        stock: p.stock || p.Stock,
        description: p.description || p.desc || p.Description || '',
        desc: p.desc || p.description || p.Description || ''
      }));
      return { items: normalized, total: normalized.length };
    } catch (_) {
      throw new Error(`listProducts failed: ${e.message}`);
    }
  }
}

export async function createProduct({ name, price, desc, category = [], subCategory = '', img = '', stock = 0, imageFile }, token) {
  const hasFile = imageFile instanceof File;
  const headers = { Authorization: `Bearer ${getToken(token)}` };
  let body;

  if (hasFile) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('desc', desc);
    formData.append('category', JSON.stringify(category));
    formData.append('subCategory', subCategory);
    formData.append('stock', stock);
    if (img) formData.append('img', img);
    formData.append('image', imageFile);
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ name, price, desc, category, subCategory, img, stock });
  }

  const r = await fetch(`${API_BASE}/api/product/add`, {
    method: 'POST',
    headers,
    body
  });
  if (!r.ok) throw new Error(`createProduct failed: ${r.status}`);
  return r.json();
}

export async function updateProduct(id, fields = {}, token) {
  const headers = { Authorization: `Bearer ${getToken(token)}` };
  const hasFile = fields.imageFile instanceof File;
  let body;

  if (hasFile) {
    const formData = new FormData();
    if (fields.name !== undefined) formData.append('name', fields.name);
    if (fields.price !== undefined) formData.append('price', fields.price);
    if (fields.description !== undefined || fields.desc !== undefined) formData.append('desc', fields.description ?? fields.desc ?? '');
    if (fields.category !== undefined) formData.append('category', JSON.stringify(fields.category));
    if (fields.subCategory !== undefined) formData.append('subCategory', fields.subCategory);
    if (fields.stock !== undefined) formData.append('stock', fields.stock);
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
    if (fields.stock !== undefined) payload.stock = fields.stock;
    if (fields.name !== undefined) payload.name = fields.name;
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const r = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: 'PATCH',
    headers,
    body
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
    headers: { Authorization: `Bearer ${getToken(token)}` }
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



