import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice'

const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { items, totalItems, subtotal, isLoading } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getCart())
  }, [dispatch])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleUpdateQuantity = (variantId, newQuantity) => {
    dispatch(updateCartItem({ variantId, quantity: newQuantity }))
  }

  const handleRemoveItem = (variantId) => {
    dispatch(removeFromCart(variantId))
      .unwrap()
      .then(() => {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      })
  }

  const shippingFee = subtotal >= 599000 ? 0 : 30000
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-dark-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-dark-900 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-dark-500 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </p>
          <Link to="/products" className="btn-primary">
            Tiếp tục mua sắm
          </Link>
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
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
              Giỏ hàng
            </h1>
            <p className="text-dark-500 mt-1">{totalItems} sản phẩm</p>
          </div>
          <Link 
            to="/products"
            className="text-primary-500 hover:text-primary-600 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden">
              {items.map((item, index) => (
                <div 
                  key={item.id}
                  className={`p-4 md:p-6 flex gap-4 ${
                    index !== items.length - 1 ? 'border-b border-dark-100' : ''
                  }`}
                >
                  {/* Image */}
                  <Link 
                    to={`/products/${item.productSlug}`}
                    className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-sand"
                  >
                    <img
                      src={getImageUrl(item.imageUrl) || '/placeholder-product.jpg'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/products/${item.productSlug}`}
                      className="font-semibold text-dark-900 hover:text-primary-500 line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-dark-500 mt-1">
                      {item.sizeName} - {item.colorName}
                    </p>
                    <p className="text-sm text-dark-400 mt-0.5">
                      SKU: {item.variantSku}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      {/* Price */}
                      <div>
                        <span className="font-bold text-primary-600">
                          {formatPrice(item.unitPrice)}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-dark-200 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-dark-50 transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            className="p-2 hover:bg-dark-50 transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.variantId)}
                          className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-2 text-right">
                      <span className="text-sm text-dark-500">Thành tiền: </span>
                      <span className="font-semibold text-dark-900">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>

                    {/* Stock warning */}
                    {!item.inStock && (
                      <p className="text-red-500 text-sm mt-2">
                        Sản phẩm đã hết hàng
                      </p>
                    )}
                    {item.inStock && item.quantity > item.availableStock && (
                      <p className="text-orange-500 text-sm mt-2">
                        Chỉ còn {item.availableStock} sản phẩm
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">Tạm tính ({totalItems} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-500 font-medium">Miễn phí</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shippingFee)}</span>
                  )}
                </div>
                {subtotal < 599000 && (
                  <p className="text-xs text-dark-500 bg-sand p-2 rounded-lg">
                    Mua thêm {formatPrice(599000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
              </div>

              <div className="border-t border-dark-100 my-4 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Vui lòng đăng nhập để thanh toán')
                    navigate('/login?redirect=/checkout')
                  } else {
                    navigate('/checkout')
                  }
                }}
                className="btn-primary w-full"
              >
                Tiến hành thanh toán
              </button>

              {/* Payment Methods */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-xs text-dark-400">Chấp nhận:</span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-dark-100 rounded text-xs">VNPay</span>
                  <span className="px-2 py-1 bg-dark-100 rounded text-xs">MoMo</span>
                  <span className="px-2 py-1 bg-dark-100 rounded text-xs">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage

