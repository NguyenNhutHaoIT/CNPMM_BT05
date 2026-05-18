const PLACEHOLDER = 'https://via.placeholder.com/600x750?text=No+Image';

export function resolveImageUrl(url) {
  if (!url) return PLACEHOLDER;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export function productAvatar(product) {
  return resolveImageUrl(product?.avatar || product?.images?.[0]?.url);
}

export function userAvatar(user) {
  if (!user?.avatar) return null;

  const url = resolveImageUrl(user.avatar);
  const separator = url.includes('?') ? '&' : '?';

  return `${url}${separator}t=${Date.now()}`;
}
