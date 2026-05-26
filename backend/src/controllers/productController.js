// FILE: /home/workdir/attachments/productController.js (ĐÃ SỬA)
const productService = require('../services/productService');

const getProducts = async (req, res) => {
  try {
    const filters = req.query;
    const options = { 
      page: parseInt(req.query.page) || 1, 
      limit: parseInt(req.query.limit) || 12, 
      sort: req.query.sort || '-createdAt' 
    };
    const data = await productService.listProducts(filters, options);
    return res.status(200).json({ EC: 0, DT: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.incrementProductViews(slug);
    if (!product) return res.status(404).json({ EC: 1, EM: "Không tìm thấy sản phẩm" });
    
    const similar = await productService.getSimilarProducts(product.category, product._id, 6);
    
    return res.status(200).json({ EC: 0, DT: { product, similar } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const products = await productService.getFeaturedProducts(limit);
    return res.status(200).json({ EC: 0, DT: products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const getNewProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getNewProducts(limit);
    return res.status(200).json({ EC: 0, DT: products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const getHotProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getHotProducts(limit);
    return res.status(200).json({ EC: 0, DT: products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    return res.status(200).json({ EC: 0, DT: categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const parseListOptions = (req) => ({
  page: parseInt(req.query.page, 10) || 1,
  limit: parseInt(req.query.limit, 10) || 10,
});

const getTopSelling = async (req, res) => {
  try {
    const data = await productService.getTopSellingProducts(parseListOptions(req));
    return res.status(200).json({ EC: 0, DT: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const getMostViewed = async (req, res) => {
  try {
    const data = await productService.getMostViewedProducts(parseListOptions(req));
    return res.status(200).json({ EC: 0, DT: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = req.body;
    // Generate slug from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    const product = await productService.createProduct(data);
    return res.status(200).json({ EC: 0, DT: product, EM: 'Tạo sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Lỗi khi tạo sản phẩm" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const product = await productService.updateProduct(id, data);
    if (!product) return res.status(404).json({ EC: 1, EM: "Không tìm thấy sản phẩm" });
    return res.status(200).json({ EC: 0, DT: product, EM: 'Cập nhật sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Lỗi khi cập nhật sản phẩm" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);
    if (!result) return res.status(404).json({ EC: 1, EM: "Không tìm thấy sản phẩm" });
    return res.status(200).json({ EC: 0, EM: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: -1, EM: "Lỗi khi xóa sản phẩm" });
  }
};

module.exports = { 
  getProducts, 
  getProduct,
  getFeaturedProducts,
  getNewProducts,
  getHotProducts,
  getCategories,
  getTopSelling,
  getMostViewed,
  createProduct,
  updateProduct,
  deleteProduct
};