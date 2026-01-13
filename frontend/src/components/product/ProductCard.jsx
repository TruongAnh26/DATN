import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // For now, add first variant if available
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.inStock) || product.variants[0]
      dispatch(addToCart({ variantId: variant.id, quantity: 1 }))
        .unwrap()
        .then(() => {
          toast.success('Đã thêm vào giỏ hàng!')
        })
        .catch((error) => {
          toast.error(error || 'Không thể thêm vào giỏ hàng')
        })
    } else {
      toast.error('Vui lòng chọn size và màu')
    }
  }

  console.log('product11111', product);

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
    <Link to={`/products/${product.slug}`} className="product-card">
      {/* Image */}
      <div className="product-card-image">
        <img
          src={getImageUrl(product?.primaryImageUrl) || '/placeholder-product.jpg'}
          alt={product.name}
          loading="lazy"
        />
        
        {/* Badges */}
        {product.onSale && product.discountPercentage > 0 && (
          <span className="product-card-badge product-card-badge-sale">
            -{product.discountPercentage}%
          </span>
        )}
        
        {!product.onSale && product.isFeatured && (
          <span className="product-card-badge product-card-badge-new">
            Mới
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-dark-900 px-4 py-2 rounded-lg font-semibold text-sm">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="product-card-actions">
          <button 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Add to wishlist
            }}
          >
            <Heart className="w-5 h-5" />
          </button>
          <button 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
          {product.inStock && (
            <button 
              className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="product-card-content">
        {product.brand && (
          <p className="product-card-brand">{product.brand.name}</p>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">
          <span className="product-card-price-current">
            {formatPrice(product.effectivePrice || product.basePrice)}
          </span>
          {product.onSale && product.salePrice && (
            <span className="product-card-price-original">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

