const getBackendBase = () => {
  const envBase = process.env.REACT_APP_API_URL || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';
  return envBase.replace(/\/$/, '');
};

const getPublicBase = () => (process.env.PUBLIC_URL || '').replace(/\/$/, '');

const normalizeCandidate = (value) => {
  if (!value) return '';
  if (Array.isArray(value)) {
    return normalizeCandidate(value.find(Boolean));
  }
  if (typeof value === 'object' && value !== null) {
    return normalizeCandidate(value.url || value.src || value.path || value.image || value.img);
  }
  return String(value);
};

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value) || value.startsWith('data:');

const stripLocalhost = (value = '') => {
  if (!value) return '';
  const trimmed = String(value).trim();
  return trimmed.replace(/^https?:\/\/localhost:\d+/i, '');
};

const shouldUsePublicBase = (value) => {
  return (
    value.startsWith('/assets/') ||
    value.startsWith('/images/') ||
    value.startsWith('/img/') ||
    value.startsWith('/static/')
  );
};

export const buildAbsoluteImageUrl = (value = '') => {
  if (!value) return '';
  const sanitized = stripLocalhost(value);
  if (isAbsoluteUrl(sanitized)) return sanitized;

  const prefixed = sanitized.startsWith('/') ? sanitized : `/${sanitized}`;

  if (shouldUsePublicBase(prefixed)) {
    const publicBase = getPublicBase();
    return `${publicBase}${prefixed}`;
  }

  const backendBase = getBackendBase();
  if (backendBase) {
    return `${backendBase}${prefixed}`;
  }

  const publicBase = getPublicBase();
  return `${publicBase}${prefixed}`;
};

export const resolveImageSource = (img, imageUrl) => {
  const candidate = normalizeCandidate(imageUrl) || normalizeCandidate(img);
  return buildAbsoluteImageUrl(candidate);
};

export const resolveProductImage = (product) => {
  if (!product) return '';
  return resolveImageSource(product.img, product.imageUrl);
};

export const extractProductImages = (product) => {
  if (!product) return [];

  const rawImages = [];
  const append = (value) => {
    const normalized = normalizeCandidate(value);
    if (normalized) rawImages.push(normalized);
  };

  if (Array.isArray(product.image)) product.image.forEach(append);
  if (Array.isArray(product.images)) product.images.forEach(append);
  if (Array.isArray(product.gallery)) product.gallery.forEach(append);
  if (Array.isArray(product.media)) product.media.forEach((m) => append(m?.url || m));

  if (product.img) append(product.img);
  if (product.imageUrl) append(product.imageUrl);

  const unique = Array.from(new Set(rawImages.map((item) => buildAbsoluteImageUrl(item)))).filter(Boolean);
  if (!unique.length) {
    const fallback = resolveProductImage(product);
    return fallback ? [fallback] : [];
  }
  return unique;
};
