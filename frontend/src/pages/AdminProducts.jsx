import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { productAvatar } from '../utils/imageUrl';

export default function AdminProducts() {
  const { auth } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    description: '',
    isNewArrival: false,
    isHot: false,
    isPromotion: false,
    isFeatured: false,
    discount: 0,
    sizes: [],
    colors: [],
    images: []
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Need a way to fetch all products for admin, but /products works for now.
      // Might want to fetch more pages or all, assuming limit=100 for admin view
      const res = await axios.get('/products?limit=100');
      if (res?.EC === 0) setProducts(res.DT.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        title: product.title || '',
        category: product.category || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        stock: product.stock || 0,
        description: product.description || '',
        isNewArrival: !!product.isNewArrival,
        isHot: !!product.isHot,
        isPromotion: !!product.isPromotion,
        isFeatured: !!product.isFeatured,
        discount: product.discount || 0,
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: product.images || []
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        category: '',
        price: 0,
        originalPrice: 0,
        stock: 0,
        description: '',
        isNewArrival: false,
        isHot: false,
        isPromotion: false,
        isFeatured: false,
        discount: 0,
        sizes: [],
        colors: [],
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // transform sizes and colors from string to array if needed
      const payload = { ...formData };
      if (typeof payload.sizes === 'string') {
        payload.sizes = payload.sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (typeof payload.colors === 'string') {
        payload.colors = payload.colors.split(',').map(c => c.trim()).filter(Boolean);
      }

      if (editingId) {
        await axios.put(`/products/admin/${editingId}`, payload);
        alert('Cập nhật thành công');
      } else {
        await axios.post('/products/admin', payload);
        alert('Thêm thành công');
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      alert('Lỗi lưu sản phẩm');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?')) return;
    try {
      await axios.delete(`/products/admin/${id}`);
      alert('Xóa thành công');
      fetchProducts();
    } catch (err) {
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 mt-2">Tổng cộng {products.length} sản phẩm</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary px-6 py-2">
          + Thêm Sản Phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">Sản phẩm</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">Danh mục</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">Giá</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">Tồn kho</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={productAvatar(p)} alt={p.title} className="w-12 h-12 rounded object-cover border" />
                    <div>
                      <div className="font-semibold text-sm">{p.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{p.category}</td>
                <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                  {p.price?.toLocaleString('vi-VN')}₫
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(p)} className="text-blue-500 hover:underline mr-4 text-sm font-medium">Sửa</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-sm font-medium">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-black text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục *</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá bán (VNĐ) *</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá gốc (VNĐ)</label>
                  <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tồn kho *</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giảm giá (%)</label>
                  <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Sizes (phân cách bằng dấu phẩy)</label>
                  <input type="text" value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full border rounded p-2" placeholder="39, 40, 41" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Màu sắc (phân cách bằng dấu phẩy)</label>
                  <input type="text" value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full border rounded p-2" placeholder="Trắng, Đen, Xanh" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2 h-24" />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isNewArrival} onChange={e => setFormData({...formData, isNewArrival: e.target.checked})} /> Hàng mới</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isHot} onChange={e => setFormData({...formData, isHot: e.target.checked})} /> Hot</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isPromotion} onChange={e => setFormData({...formData, isPromotion: e.target.checked})} /> Khuyến mãi</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} /> Nổi bật</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 border rounded font-medium hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800">Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
