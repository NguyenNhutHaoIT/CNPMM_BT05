const MEDIA_PREFIX = '/v1/api/media';

const productImageUrl = (productId, index) =>
  `${MEDIA_PREFIX}/products/${productId}/images/${index}`;

const productAvatarUrl = (productId) => `${MEDIA_PREFIX}/products/${productId}/avatar`;

const userAvatarUrl = (userId) => `${MEDIA_PREFIX}/users/${userId}/avatar`;

const fileToStoredImage = (file, alt = '') => ({
  data: file.buffer,
  contentType: file.mimetype,
  alt: alt || file.originalname || 'Ảnh',
});

const bufferToStoredImage = (buffer, contentType, alt = '') => ({
  data: buffer,
  contentType: contentType || 'image/jpeg',
  alt,
});

/** Tải ảnh từ URL (dùng khi seed) */
const fetchImageBuffer = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FullStack-ShoeStore/1.0)',
      Accept: 'image/*',
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, contentType };
};

const mapProductWithMediaUrls = (product) => {
  if (!product) return product;
  const id = product._id?.toString() || product.id;
  if (!id) return product;

  const imageCount = product.images?.length || 0;
  const images = Array.from({ length: imageCount }, (_, i) => ({
    url: productImageUrl(id, i),
    alt: product.images[i]?.alt || '',
    _id: product.images[i]?._id,
  }));

  return {
    ...product,
    images,
    avatar: imageCount > 0 ? productAvatarUrl(id) : '',
  };
};

const mapProductsWithMediaUrls = (items) => items.map(mapProductWithMediaUrls);

const setUserAvatarUrl = (user) => {
  if (!user) return user;
  const id = user._id?.toString() || user.id;
  const hasAvatar = Boolean(user.avatarImage?.data || user.avatarImage?.contentType);
  return {
    ...user,
    avatar: hasAvatar ? userAvatarUrl(id) : '',
  };
};

module.exports = {
  MEDIA_PREFIX,
  productImageUrl,
  productAvatarUrl,
  userAvatarUrl,
  fileToStoredImage,
  bufferToStoredImage,
  fetchImageBuffer,
  mapProductWithMediaUrls,
  mapProductsWithMediaUrls,
  setUserAvatarUrl,
};
