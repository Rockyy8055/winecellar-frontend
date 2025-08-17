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
        stock: p.stock
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
      stock: p.stock
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
        stock: p.stock || p.Stock
      }));
      return { items: normalized, total: normalized.length };
    } catch (_) {
      throw new Error(`listProducts failed: ${e.message}`);
    }
  }
}

export async function createProduct({ name, price, desc, category = [], subCategory = '', img = '', stock = 0 }, token) {
  const r = await fetch(`${API_BASE}/api/product/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken(token)}` },
    body: JSON.stringify({ name, price, desc, category, subCategory, img, stock })
  });
  if (!r.ok) throw new Error(`createProduct failed: ${r.status}`);
  return r.json();
}

export async function updateProduct(id, fields = {}, token) {
  const body = {};
  if (fields.price !== undefined) body.price = fields.price;
  if (fields.description !== undefined) body.desc = fields.description; // map to desc per backend
  if (fields.desc !== undefined) body.desc = fields.desc;
  if (fields.img !== undefined) body.img = fields.img;
  if (fields.category !== undefined) body.category = fields.category;
  if (fields.subCategory !== undefined) body.subCategory = fields.subCategory;
  if (fields.stock !== undefined) body.stock = fields.stock;
  if (fields.name !== undefined) body.name = fields.name;
  const r = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken(token)}` },
    body: JSON.stringify(body)
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

// Image changes are sent via updateProduct with img URL

