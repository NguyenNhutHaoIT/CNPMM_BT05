const Product = require('../models/product');
const { mapProductWithMediaUrls, mapProductsWithMediaUrls } = require('../utils/imageStorage');

/** Không load binary ảnh khi list API — chỉ metadata */
const PUBLIC_SELECT = '-images.data';

const normalizeProduct = (product) => mapProductWithMediaUrls(product);
const normalizeList = (items) => mapProductsWithMediaUrls(items);

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
    Product.find(query).select(PUBLIC_SELECT).sort(sort).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(query),
  ]);

  return {
    items: normalizeList(items),
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

const getProductBySlug = async (slug) =>
  normalizeProduct(
    await Product.findOne({ slug }).select(PUBLIC_SELECT).lean()
  );

const getFeaturedProducts = async (limit = 6) =>
  normalizeList(
    await Product.find({ isFeatured: true })
      .select(PUBLIC_SELECT)
      .limit(limit)
      .sort('-createdAt')
      .lean()
  );

const getNewProducts = async (limit = 8) =>
  normalizeList(
    await Product.find({ isNewArrival: true })
      .select(PUBLIC_SELECT)
      .limit(limit)
      .sort('-createdAt')
      .lean()
  );

const getHotProducts = async (limit = 8) =>
  normalizeList(
    await Product.find({ isHot: true }).select(PUBLIC_SELECT).limit(limit).sort('-sold').lean()
  );

const getSimilarProducts = async (category, productId, limit = 6) =>
  normalizeList(
    await Product.find({ category, _id: { $ne: productId } })
      .select(PUBLIC_SELECT)
      .limit(limit)
      .lean()
  );

const getCategories = async () => Product.distinct('category');

const paginatedBySort = async (sortField, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find({}).select(PUBLIC_SELECT).sort({ [sortField]: -1 }).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments({}),
  ]);
  return {
    items: normalizeList(items),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getTopSellingProducts = (options) => paginatedBySort('sold', options);

const getMostViewedProducts = (options) => paginatedBySort('views', options);

const incrementProductViews = async (slug) => {
  const product = await Product.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 }, $set: { updatedAt: new Date() } },
    { new: true }
  )
    .select(PUBLIC_SELECT)
    .lean();
  return normalizeProduct(product);
};

module.exports = {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  getNewProducts,
  getHotProducts,
  getSimilarProducts,
  getCategories,
  getTopSellingProducts,
  getMostViewedProducts,
  incrementProductViews,
};
