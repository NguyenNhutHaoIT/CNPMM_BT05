const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/products');
const API_BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 8080}`;

const img = (url, alt) => ({ url, alt });

/**
 * Ưu tiên ảnh local trong uploads/products/{slug}/, không có thì dùng URL mẫu.
 */
function resolveProductImages(slug, fallbackImages) {
  const dir = path.join(UPLOADS_DIR, slug);
  if (!fs.existsSync(dir)) return fallbackImages;

  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort();

  if (!files.length) return fallbackImages;

  return files.map((file, index) =>
    img(`${API_BASE}/uploads/products/${slug}/${file}`, `${slug} - ${index + 1}`)
  );
}

function withAvatar(product) {
  const images = product.images || [];
  const avatar = product.avatar || images[0]?.url || '';
  return { ...product, images, avatar };
}

module.exports = { img, resolveProductImages, withAvatar, UPLOADS_DIR };
