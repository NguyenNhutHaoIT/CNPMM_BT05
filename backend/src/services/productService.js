// backend/services/productService.js
const Product = require('../models/product');

const normalizeProduct = (product) => {
  if (!product) return product;
  if (!product.avatar && product.images?.[0]?.url) {
    product.avatar = product.images[0].url;
  }
  return product;
};

const normalizeList = (items) => items.map(normalizeProduct);

const listProducts = async (filters = {}, options = {}) => {
  const { page = 1, limit = 12, sort = '-createdAt' } = options;
  const query = {};
  
  if (filters.q) query.$text = { $search: filters.q };
  if (filters.category) query.category = filters.category;
  if (filters.priceMin || filters.priceMax) {
    query.price = {};
    if (filters.priceMin) query.price.$gte = Number(filters.priceMin);
    if (filters.priceMax) query.price.$lte = Number(filters.priceMax);
  }
  if (filters.inStock === 'true') query.stock = { $gt: 0 };
  if (filters.isNew === 'true') query.isNewArrival = true;
  if (filters.isHot === 'true') query.isHot = true;
  if (filters.isPromotion === 'true') query.isPromotion = true;
  if (filters.isFeatured === 'true') query.isFeatured = true;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(query)
  ]);
  
  return {
    items: normalizeList(items),
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

const getProductBySlug = async (slug) =>
  normalizeProduct(await Product.findOne({ slug }).lean());

const getFeaturedProducts = async (limit = 6) =>
  normalizeList(
    await Product.find({ isFeatured: true }).limit(limit).sort('-createdAt').lean()
  );

const getNewProducts = async (limit = 8) =>
  normalizeList(
    await Product.find({ isNewArrival: true }).limit(limit).sort('-createdAt').lean()
  );

const getHotProducts = async (limit = 8) =>
  normalizeList(await Product.find({ isHot: true }).limit(limit).sort('-sold').lean());

const getSimilarProducts = async (category, productId, limit = 6) =>
  normalizeList(
    await Product.find({ category, _id: { $ne: productId } }).limit(limit).lean()
  );

const getCategories = async () => Product.distinct('category');

module.exports = { 
  listProducts, 
  getProductBySlug,
  getFeaturedProducts,
  getNewProducts,
  getHotProducts,
  getSimilarProducts,
  getCategories
};