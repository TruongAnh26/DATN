import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ChevronLeft,
  Check,
  Plus,
  Edit2
} from 'lucide-react'
import toast from 'react-hot-toast'
import orderService from '../services/orderService'
import paymentService from '../services/paymentService'
import { clearCart } from '../store/slices/cartSlice'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items, subtotal } = useSelector((state) => state.cart)

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState(null) // { paymentUrl, qrCode, orderCode }
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  // Address form
  const [addressForm, setAddressForm] = useState({
    recipientName: user?.fullName || '',
    recipientPhone: user?.phoneNumber || '',
    shippingProvince: '',
    shippingDistrict: '',
    shippingWard: '',
    shippingAddress: '',
    guestEmail: ''
  })

  const paymentMethods = [
    { id: 'COD', name: 'Thanh toán khi nhận hàng', icon: '💵', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
    { id: 'VNPAY', name: 'VNPay', icon: '🏦', desc: 'Thanh toán qua cổng VNPay' },
    { id: 'MOMO', name: 'Ví MoMo', icon: '📱', desc: 'Thanh toán qua ví điện tử MoMo' },
  ]

  const shippingMethods = [
    { id: 'standard', name: 'Giao hàng tiêu chuẩn', price: 30000, time: '3-5 ngày' },
    { id: 'express', name: 'Giao hàng nhanh', price: 50000, time: '1-2 ngày' },
  ]

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
      return
    }
    // Pre-fill with user info if logged in
    if (user) {
      setAddressForm(prev => ({
        ...prev,
        recipientName: user?.fullName || '',
        recipientPhone: user?.phoneNumber || ''
      }))
    }
  }, [user, items, navigate])

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddressForm(prev => ({ ...prev, [name]: value }))
  }

  const isAddressValid = () => {
    const baseValid = addressForm.recipientName && 
           addressForm.recipientPhone && 
           addressForm.shippingProvince && 
           addressForm.shippingDistrict && 
           addressForm.shippingWard && 
           addressForm.shippingAddress
    
    // Guest checkout requires email
    if (!user) {
      return baseValid && addressForm.guestEmail && addressForm.guestEmail.includes('@')
    }
    return baseValid
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const selectedShipping = shippingMethods.find(s => s.id === shippingMethod)
  const shippingFee = subtotal >= 599000 ? 0 : (selectedShipping?.price || 30000)
  const total = subtotal + shippingFee

  const handlePlaceOrder = async () => {
    if (!isAddressValid()) {
      toast.error('Vui lòng điền đầy đủ địa chỉ giao hàng')
      setStep(1)
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        ...addressForm,
        paymentMethod,
        shippingMethod,
        notes
      }
      
      const order = await orderService.createOrder(orderData)
      
      // If payment method is VNPay or MoMo, create payment and show QR code
      if (paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') {
        try {
          const payment = await paymentService.createPayment(order.id, total)
          console.log('Payment response:', payment) // Debug log
          
          if (!payment.qrCode) {
            console.error('QR code is missing in payment response')
            toast.error('Không thể tạo mã QR. Vui lòng thử lại hoặc sử dụng link thanh toán.')
          }
          
          setPaymentData({
            paymentUrl: payment.paymentUrl,
            qrCode: payment.qrCode, // Base64 encoded QR code
            orderCode: order.orderCode,
            gateway: payment.gateway
          })
          
          if (payment.qrCode) {
            toast.success('Mã QR đã được tạo. Vui lòng quét mã để thanh toán.')
          } else {
            toast('Mã QR chưa sẵn sàng. Vui lòng sử dụng link thanh toán bên dưới.', { icon: '⚠️' })
          }
          
          setShowPaymentModal(true)
          // Don't clear cart yet - let user see QR code first
          // Cart will be cleared when user closes modal or payment succeeds
        } catch (error) {
          toast.error('Có lỗi xảy ra khi tạo thanh toán')
          console.error('Payment creation error:', error)
          console.error('Error response:', error.response?.data)
        }
      } else {
        // COD - redirect to success page
        dispatch(clearCart())
        toast.success('Đặt hàng thành công!')
        navigate(`/order-success?code=${order.orderCode}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) return null

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
      {/* Header */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-4">
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 hover:bg-sand rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-display font-bold text-dark-900">
              Thanh toán
            </h1>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mt-4">
            {[
              { num: 1, label: 'Địa chỉ' },
              { num: 2, label: 'Thanh toán' },
              { num: 3, label: 'Xác nhận' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    step >= s.num
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-100 text-dark-500'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : <span>{s.num}</span>}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-2 ${step > s.num ? 'bg-primary-500' : 'bg-dark-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Địa chỉ giao hàng
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Họ tên người nhận *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={addressForm.recipientName}
                      onChange={handleAddressChange}
                      placeholder="Nguyễn Văn A"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="recipientPhone"
                      value={addressForm.recipientPhone}
                      onChange={handleAddressChange}
                      placeholder="0901234567"
                      className="input"
                      required
                    />
                  </div>
                  {!user && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Email * (để nhận thông tin đơn hàng)
                      </label>
                      <input
                        type="email"
                        name="guestEmail"
                        value={addressForm.guestEmail}
                        onChange={handleAddressChange}
                        placeholder="email@example.com"
                        className="input"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <input
                      type="text"
                      name="shippingProvince"
                      value={addressForm.shippingProvince}
                      onChange={handleAddressChange}
                      placeholder="TP. Hồ Chí Minh"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <input
                      type="text"
                      name="shippingDistrict"
                      value={addressForm.shippingDistrict}
                      onChange={handleAddressChange}
                      placeholder="Quận 1"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Phường/Xã *
                    </label>
                    <input
                      type="text"
                      name="shippingWard"
                      value={addressForm.shippingWard}
                      onChange={handleAddressChange}
                      placeholder="Phường Bến Nghé"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Địa chỉ chi tiết *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={addressForm.shippingAddress}
                      onChange={handleAddressChange}
                      placeholder="123 Nguyễn Huệ"
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Ghi chú cho người bán
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Giao hàng giờ hành chính..."
                    className="input"
                    rows={3}
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="btn-primary w-full mt-6"
                  disabled={!isAddressValid()}
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Shipping Method */}
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-primary-500" />
                    Phương thức vận chuyển
                  </h2>

                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          shippingMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-dark-200 hover:border-dark-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === method.id}
                            onChange={() => setShippingMethod(method.id)}
                            className="w-4 h-4 text-primary-500"
                          />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-dark-500">{method.time}</p>
                          </div>
                        </div>
                        <span className="font-semibold">
                          {subtotal >= 599000 ? 'Miễn phí' : formatPrice(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary-500" />
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-dark-200 hover:border-dark-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-2xl mx-3">{method.icon}</span>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-dark-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-outline flex-1"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="btn-primary flex-1"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Delivery Info */}
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
                    <button onClick={() => setStep(1)} className="text-primary-500 text-sm">
                      Thay đổi
                    </button>
                  </div>
                  <div className="bg-sand rounded-xl p-4">
                    <p className="font-semibold">{addressForm.recipientName} | {addressForm.recipientPhone}</p>
                    <p className="text-dark-600 text-sm mt-1">
                      {addressForm.shippingAddress}, {addressForm.shippingWard}, {addressForm.shippingDistrict}, {addressForm.shippingProvince}
                    </p>
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-dark-500">Phương thức thanh toán: </span>
                    <span className="font-medium">
                      {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={getImageUrl(item.imageUrl) || '/placeholder-product.jpg'}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg bg-sand"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-dark-500">{item.sizeName} - {item.colorName}</p>
                          <p className="text-sm text-dark-500">x{item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-outline flex-1"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="btn-primary flex-1"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">Tạm tính ({items.length} sản phẩm)</span>
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
              </div>

              <div className="border-t border-dark-100 my-4 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal with QR Code */}
      {showPaymentModal && paymentData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Prevent closing when clicking outside - user must use buttons
            if (e.target === e.currentTarget) {
              // Optionally allow closing by clicking outside
              // setShowPaymentModal(false)
            }
          }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowPaymentModal(false)
                dispatch(clearCart())
              }}
              className="absolute top-4 right-4 text-dark-400 hover:text-dark-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-display font-bold text-center mb-4">
              Thanh toán qua {paymentData.gateway === 'VNPAY' ? 'VNPay' : 'MoMo'}
            </h2>
            
            <div className="text-center mb-6">
              <p className="text-dark-600 mb-2">Mã đơn hàng: <span className="font-semibold">{paymentData.orderCode}</span></p>
              <p className="text-dark-600 mb-4">Số tiền: <span className="font-semibold text-primary-600">{formatPrice(total)}</span></p>
            </div>

            {/* QR Code */}
            {paymentData.qrCode ? (
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm text-dark-500 mb-3">Quét mã QR để thanh toán</p>
                <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-lg">
                  <img 
                    src={`data:image/png;base64,${paymentData.qrCode}`} 
                    alt="QR Code" 
                    className="w-64 h-64"
                    onError={(e) => {
                      console.error('Error loading QR code image:', e)
                      e.target.style.display = 'none'
                      // Show fallback message
                      const parent = e.target.parentElement
                      if (parent && !parent.querySelector('.qr-error')) {
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'qr-error text-red-500 text-sm mt-2'
                        errorDiv.textContent = 'Không thể hiển thị QR code'
                        parent.appendChild(errorDiv)
                      }
                    }}
                  />
                </div>
              </div>
            ) : paymentData.paymentUrl ? (
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm text-yellow-600 mb-3">Mã QR chưa sẵn sàng. Vui lòng sử dụng link bên dưới để thanh toán.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm text-dark-500 mb-3">Đang tạo mã QR...</p>
                <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-200 w-64 h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              </div>
            )}

            {/* Payment URL Button */}
            {paymentData.paymentUrl && (
              <div className="mb-6">
                <a
                  href={paymentData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full block text-center"
                >
                  Mở trang thanh toán
                </a>
              </div>
            )}

            <div className="text-center text-sm text-dark-500 mb-4">
              <p>Vui lòng hoàn tất thanh toán trong vòng 15 phút</p>
              <p>Đơn hàng sẽ tự động hủy nếu không thanh toán</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  dispatch(clearCart()) // Clear cart when user closes modal
                  navigate(`/orders/track/${paymentData.orderCode}`)
                }}
                className="btn-outline flex-1"
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  dispatch(clearCart()) // Clear cart when user closes modal
                  navigate('/')
                }}
                className="btn-primary flex-1"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage

