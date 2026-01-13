import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  MapPin,
  Phone,
  User,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import orderService from '../services/orderService'

const OrderDetailPage = () => {
  const { orderCode } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderCode])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const data = await orderService.getOrderByCode(orderCode)
      setOrder(data)
    } catch (error) {
      toast.error('Không tìm thấy đơn hàng')
      navigate('/orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    
    try {
      await orderService.cancelOrder(order.id, 'Khách hàng yêu cầu hủy')
      toast.success('Đã hủy đơn hàng')
      fetchOrder()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Package },
      PAID: { label: 'Đã thanh toán', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
      PROCESSING: { label: 'Đang xử lý', color: 'text-purple-600', bg: 'bg-purple-100', icon: Package },
      SHIPPING: { label: 'Đang giao hàng', color: 'text-orange-600', bg: 'bg-orange-100', icon: Truck },
      COMPLETED: { label: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
      CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
    }
    return statusMap[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Package }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-sand rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-dark-900">
                Chi tiết đơn hàng
              </h1>
              <p className="text-sm text-dark-500">{order.orderCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                  <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-sm text-dark-500">Ngày đặt: {formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6 border-t border-dark-100 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium">Đặt hàng thành công</p>
                      <p className="text-sm text-dark-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.paidAt && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium">Đã thanh toán</p>
                        <p className="text-sm text-dark-500">{formatDate(order.paidAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium">Đang vận chuyển</p>
                        <p className="text-sm text-dark-500">{formatDate(order.shippedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.completedAt && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium">Giao hàng thành công</p>
                        <p className="text-sm text-dark-500">{formatDate(order.completedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div>
                        <p className="font-medium text-red-600">Đơn hàng đã bị hủy</p>
                        <p className="text-sm text-dark-500">{formatDate(order.cancelledAt)}</p>
                        {order.cancellationReason && (
                          <p className="text-sm text-dark-500">Lý do: {order.cancellationReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Sản phẩm ({order.totalItems})</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className={`flex gap-4 ${index > 0 ? 'pt-4 border-t border-dark-100' : ''}`}>
                    <img
                      src={item.productImageUrl || '/placeholder-product.jpg'}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg bg-sand"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-dark-500">{item.sizeName} - {item.colorName}</p>
                      <p className="text-sm text-dark-500">SKU: {item.variantSku}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-dark-500">x{item.quantity}</span>
                        <span className="font-semibold text-primary-600">{formatPrice(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Thông tin giao hàng</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span>{order.recipientName}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span>{order.recipientPhone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span className="text-sm">{order.fullShippingAddress}</span>
                </div>
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-dark-100">
                  <p className="text-sm text-dark-500">Ghi chú: {order.notes}</p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Thanh toán</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">Phí vận chuyển</span>
                  <span>{order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Miễn phí'}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dark-100">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-100">
                <p className="text-sm text-dark-500">
                  Phương thức: {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Actions */}
            {(order.status === 'PENDING' || order.status === 'PAID') && user && (
              <button
                onClick={handleCancelOrder}
                className="btn w-full bg-red-500 text-white hover:bg-red-600"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage

