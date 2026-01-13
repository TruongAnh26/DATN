import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    basePrice: '',
    salePrice: '',
    categoryId: '',
    brandId: '',
    gender: 'UNISEX',
    ageGroup: '',
    material: '',
    careInstructions: '',
    featured: false,
    active: true,
    metaTitle: '',
    metaDescription: '',
    images: [],
    variants: [],
  });

  const [newVariant, setNewVariant] = useState({ sizeId: '', colorId: '', priceAdjustment: 0, quantity: 0 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFormData();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchFormData = async () => {
    try {
      const [categoriesRes, brandsRes, sizesRes, colorsRes] = await Promise.all([
        api.get('/categories/tree'),
        api.get('/brands'),
        api.get('/sizes'),
        api.get('/colors'),
      ]);
      
      setCategories(categoriesRes.data?.data || []);
      setBrands(brandsRes.data?.data || []);
      setSizes(sizesRes.data?.data || []);
      setColors(colorsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/products/${id}`);
      const product = response.data?.data;
      
      if (product) {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          basePrice: product.basePrice || '',
          salePrice: product.salePrice || '',
          categoryId: product.categoryId || '',
          brandId: product.brandId || '',
          gender: product.gender || 'UNISEX',
          ageGroup: product.ageGroup || '',
          material: product.material || '',
          careInstructions: product.careInstructions || '',
          featured: product.featured || false,
          active: product.active !== false,
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          images: product.images || [],
          variants: product.variants || [],
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Không tìm thấy sản phẩm');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const response = await api.post('/uploads/images', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data?.success) {
          const imageData = response.data.data;
          uploadedImages.push({
            url: imageData.url,
            alt: imageData.originalName || '',
            isPrimary: formData.images.length === 0 && uploadedImages.length === 0,
            displayOrder: formData.images.length + uploadedImages.length,
          });
        }
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleAddVariant = () => {
    if (!newVariant.sizeId || !newVariant.colorId) return;
    
    // Check for duplicate
    const exists = formData.variants.some(
      v => v.sizeId == newVariant.sizeId && v.colorId == newVariant.colorId
    );
    if (exists) {
      alert('Biến thể này đã tồn tại');
      return;
    }

    const size = sizes.find(s => s.id == newVariant.sizeId);
    const color = colors.find(c => c.id == newVariant.colorId);

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { 
        ...newVariant,
        sizeName: size?.name,
        colorName: color?.name,
        colorCode: color?.colorCode,
        sku: `${formData.sku}-${size?.name}-${color?.name}`.toUpperCase(),
      }],
    }));
    setNewVariant({ sizeId: '', colorId: '', priceAdjustment: 0, quantity: 0 });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const generateSKU = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, sku: `SP-${random}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.basePrice) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate sale price
    if (formData.salePrice && formData.basePrice) {
      if (parseFloat(formData.salePrice) > parseFloat(formData.basePrice)) {
        alert('Giá khuyến mãi không được lớn hơn giá gốc');
        return;
      }
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
      };

      if (isEditing) {
        await api.put(`/admin/products/${id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const flattenCategories = (cats, level = 0) => {
    return cats.reduce((acc, cat) => {
      acc.push({ ...cat, level });
      if (cat.children?.length > 0) {
        acc.push(...flattenCategories(cat.children, level + 1));
      }
      return acc;
    }, []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
            <p className="text-gray-600">Điền đầy đủ thông tin sản phẩm</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mã SKU"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateSKU}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                        title="Tạo tự động"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UNISEX">Unisex</option>
                      <option value="BOYS">Bé trai</option>
                      <option value="GIRLS">Bé gái</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả ngắn
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả ngắn gọn về sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết sản phẩm"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
              
              {/* Upload from computer */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tải ảnh từ máy tính
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-600">Đang tải lên...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 text-sm">Nhấn để chọn ảnh hoặc kéo thả</span>
                        <span className="text-gray-400 text-xs mt-1">PNG, JPG, GIF tối đa 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Image List */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => {
                    // Xử lý URL ảnh - nếu là đường dẫn local thì thêm API base
                    const rawUrl = image.url || image.imageUrl || '';
                    let imageUrl = rawUrl;
                    if (rawUrl.startsWith('/uploads')) {
                      imageUrl = `http://localhost:8080/api${rawUrl}`;
                    } else if (rawUrl.startsWith('/')) {
                      // Handle old URLs like /products/xxx.jpg
                      imageUrl = `http://localhost:8080/api/uploads${rawUrl}`;
                    }
                    
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={image.alt || `Ảnh ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 ${
                            image.isPrimary ? 'border-blue-500' : 'border-gray-200'
                          }`}
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/150x150?text=No+Image';
                          }}
                        />
                        {image.isPrimary && (
                          <span className="absolute top-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                            Chính
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index)}
                              className="p-1 bg-white rounded text-blue-600 hover:bg-blue-50"
                              title="Đặt làm ảnh chính"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 bg-white rounded text-red-600 hover:bg-red-50"
                            title="Xóa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Biến thể sản phẩm</h2>
              
              {/* Variant List */}
              {formData.variants.length > 0 && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Size</th>
                        <th className="px-4 py-2 text-left">Màu</th>
                        <th className="px-4 py-2 text-left">Điều chỉnh giá</th>
                        <th className="px-4 py-2 text-left">Số lượng</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.variants.map((variant, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{variant.sizeName}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <span
                                className="w-4 h-4 rounded-full mr-2 border"
                                style={{ backgroundColor: variant.colorCode }}
                              />
                              {variant.colorName}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={variant.priceAdjustment}
                              onChange={(e) => handleUpdateVariant(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={variant.quantity}
                              onChange={(e) => handleUpdateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Variant */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Size</label>
                  <select
                    value={newVariant.sizeId}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sizeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Chọn size</option>
                    {sizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Màu sắc</label>
                  <select
                    value={newVariant.colorId}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, colorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Chọn màu</option>
                    {colors.map(color => (
                      <option key={color.id} value={color.id}>{color.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={newVariant.quantity}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Giá bán</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá gốc <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₫</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá khuyến mãi
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân loại</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn danh mục</option>
                    {flattenCategories(categories).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {'—'.repeat(cat.level)} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Độ tuổi
                  </label>
                  <input
                    type="text"
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: 2-4 tuổi"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h2>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hiển thị sản phẩm</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Sản phẩm nổi bật</span>
                </label>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thêm</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chất liệu
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Cotton 100%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hướng dẫn bảo quản
                  </label>
                  <textarea
                    name="careInstructions"
                    value={formData.careInstructions}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Giặt máy ở 30°C"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;


