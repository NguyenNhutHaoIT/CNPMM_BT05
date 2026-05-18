const { bufferToStoredImage, fetchImageBuffer } = require('./imageStorage');

/** Metadata ảnh seed (URL nguồn sẽ được tải và lưu Buffer vào DB) */
const img = (url, alt) => ({ url, alt });

/** Tải danh sách ảnh từ URL và chuyển thành document lưu MongoDB */
async function resolveProductImagesForDb(imageMetas) {
  const stored = [];
  for (const meta of imageMetas) {
    try {
      const { buffer, contentType } = await fetchImageBuffer(meta.url);
      stored.push(bufferToStoredImage(buffer, contentType, meta.alt));
    } catch (err) {
      console.warn('Skip image:', meta.url, err.message);
    }
  }
  return stored;
}

async function prepareProductForSeed(product) {
  const images = await resolveProductImagesForDb(product.images || []);
  return { ...product, images, avatar: '' };
}

module.exports = {
  img,
  resolveProductImagesForDb,
  prepareProductForSeed,
};
