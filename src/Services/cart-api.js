import { API_BASE, buildAuthHeaders } from './auth-api';

const resolveItemsFromResponse = async (response) => {
  if (response.status === 204) {
    return [];
  }

  const data = await response
    .json()
    .catch(() => null);

  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

export const fetchCart = async () => {
  const res = await fetch(new URL('/api/cart', API_BASE).toString(), {
    headers: buildAuthHeaders({ Accept: 'application/json' }),
    credentials: 'include'
  });

  if (res.status === 401 || res.status === 403) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch cart: ${res.status}`);
  }

  return resolveItemsFromResponse(res);
};

export const persistCart = async (items) => {
  const res = await fetch(new URL('/api/cart', API_BASE).toString(), {
    method: 'PUT',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    }),
    credentials: 'include',
    body: JSON.stringify({ items })
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Not authenticated');
  }

  if (!res.ok) {
    throw new Error(`Failed to update cart: ${res.status}`);
  }

  return resolveItemsFromResponse(res);
};

export const clearRemoteCart = async () => {
  const res = await fetch(new URL('/api/cart', API_BASE).toString(), {
    method: 'DELETE',
    headers: buildAuthHeaders({ Accept: 'application/json' }),
    credentials: 'include'
  });

  if (res.status === 401 || res.status === 403) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Failed to clear cart: ${res.status}`);
  }

  return resolveItemsFromResponse(res);
};
