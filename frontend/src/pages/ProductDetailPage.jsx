import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  ShoppingBag, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Check,
  ChevronRight,
  Truck,
  RefreshCw,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getProductBySlug, getRelatedProducts, clearCurrentProduct } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import ProductGrid from '../components/product/ProductGrid'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  
  const { currentProduct: product, relatedProducts, isLoading } = useSelector((state) => state.product)
  const { isLoading: cartLoading } = useSelector((state) => state.cart)

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    dispatch(getProductBySlug(slug))
    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [dispatch, slug])

  useEffect(() => {
    if (product?.id) {
      dispatch(getRelatedProducts(product.id))
    }
  }, [dispatch, product?.id])

  useEffect(() => {
    // Find variant when size and color are selected
    if (product?.variants && selectedSize && selectedColor) {
      const variant = product.variants.find(
        v => v.size.id === selectedSize && v.color.id === selectedColor
      )
      setSelectedVariant(variant || null)
    } else {
      setSelectedVariant(null)
    }
  }, [product, selectedSize, selectedColor])

  // Get unique sizes and colors
  const availableSizes = product?.variants
    ? [...new Map(product.variants.map(v => [v.size.id, v.size])).values()]
    : []
  
  const availableColors = product?.variants
    ? [...new Map(product.variants.map(v => [v.color.id, v.color])).values()]
    : []

  // Get available colors for selected size
  const getColorsForSize = (sizeId) => {
    if (!product?.variants) return []
    return product.variants
      .filter(v => v.size.id === sizeId && v.inStock)
      .map(v => v.color.id)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn size và màu')
      return
    }

    if (!selectedVariant.inStock) {
      toast.error('Sản phẩm đã hết hàng')
      return
    }

    dispatch(addToCart({ variantId: selectedVariant.id, quantity }))
      .unwrap()
      .then(() => {
        toast.success('Đã thêm vào giỏ hàng!')
      })
      .catch((error) => {
        toast.error(error || 'Không thể thêm vào giỏ hàng')
      })
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container-custom py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-sand rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-sand rounded w-1/4" />
              <div className="h-8 bg-sand rounded w-3/4" />
              <div className="h-6 bg-sand rounded w-1/3" />
              <div className="h-24 bg-sand rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getImageUrl = (url) => {
    if (!url) return 'https://placehold.co/100x100?text=No+Image';
    if (url.startsWith('/uploads')) {
      return `http://localhost:8080/api${url}`;
    }
    if (url.startsWith('/')) {
      return `http://localhost:8080/api/uploads${url}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-dark-500 hover:text-primary-500">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 text-dark-400" />
            <Link to="/products" className="text-dark-500 hover:text-primary-500">Sản phẩm</Link>
            <ChevronRight className="w-4 h-4 text-dark-400" />
            <span className="text-dark-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden">
              <img
                src={getImageUrl(product?.primaryImageUrl) || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <Link 
                to={`/brand/${product.brand.slug}`}
                className="text-sm font-medium text-dark-500 uppercase tracking-wider hover:text-primary-500"
              >
                {product.brand.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(selectedVariant?.finalPrice || product.effectivePrice)}
              </span>
              {product.onSale && (
                <>
                  <span className="text-lg text-dark-400 line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="badge bg-red-100 text-red-600">
                    -{product.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-dark-600 mb-6">{product.shortDescription}</p>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Kích cỡ</span>
                <button className="text-sm text-primary-500 hover:underline">
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const hasStock = product.variants.some(
                    v => v.size.id === size.id && v.inStock
                  )
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      disabled={!hasStock}
                      className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size.id
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : hasStock
                          ? 'border-dark-200 hover:border-dark-400'
                          : 'border-dark-100 text-dark-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {size.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <span className="font-medium mb-3 block">
                Màu sắc: {selectedColor && availableColors.find(c => c.id === selectedColor)?.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isAvailable = !selectedSize || getColorsForSize(selectedSize).includes(color.id)
                  return (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      disabled={!isAvailable}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.id
                          ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-2'
                          : isAvailable
                          ? 'border-dark-200 hover:border-dark-400'
                          : 'border-dark-100 opacity-40 cursor-not-allowed'
                      }`}
                      style={{ backgroundColor: color.hexCode || '#ccc' }}
                      title={color.name}
                    >
                      {selectedColor === color.id && (
                        <Check className={`absolute inset-0 m-auto w-5 h-5 ${
                          color.hexCode?.toLowerCase() === '#ffffff' ? 'text-dark-900' : 'text-white'
                        }`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <span className="font-medium mb-3 block">Số lượng</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-dark-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-dark-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant && quantity >= selectedVariant.availableQuantity}
                    className="p-3 hover:bg-dark-50 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {selectedVariant && (
                  <span className="text-sm text-dark-500">
                    Còn {selectedVariant.availableQuantity} sản phẩm
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !selectedVariant?.inStock}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
              <button className="btn-outline p-3">
                <Heart className="w-5 h-5" />
              </button>
              <button className="btn-outline p-3">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-dark-100 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary-500" />
                <span className="text-sm">Miễn phí vận chuyển cho đơn từ 599K</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary-500" />
                <span className="text-sm">Đổi trả miễn phí trong 30 ngày</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary-500" />
                <span className="text-sm">Cam kết 100% chính hãng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-12 bg-white rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Mô tả sản phẩm</h2>
            <div 
              className="prose prose-sm max-w-none text-dark-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-display font-bold mb-6">Sản phẩm liên quan</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage

