import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Package, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import orderService from '../services/orderService'

const OrdersPage = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, activeStatus, page])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const status = activeStatus === 'all' ? null : activeStatus
      const data = await orderService.getMyOrders(status, page, 10)
      setOrders(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    
    try {
      await orderService.cancelOrder(orderId, 'Khách hàng yêu cầu hủy')
      toast.success('Đã hủy đơn hàng')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng')
    }
  }

  const statusTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'PAID', label: 'Đã thanh toán' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'COMPLETED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-700' },
      PAID: { label: 'Đã thanh toán', class: 'bg-blue-100 text-blue-700' },
      PROCESSING: { label: 'Đang xử lý', class: 'bg-purple-100 text-purple-700' },
      SHIPPING: { label: 'Đang giao', class: 'bg-orange-100 text-orange-700' },
      COMPLETED: { label: 'Hoàn thành', class: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', class: 'bg-red-100 text-red-700' },
    }
    const s = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-700' }
    return <span className={`badge ${s.class}`}>{s.label}</span>
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    return order.orderCode.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
            Đơn hàng của tôi
          </h1>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn hàng..."
                className="input pl-12"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveStatus(tab.id); setPage(0); }}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeStatus === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-sand text-dark-600 hover:bg-dark-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto" />
            <p className="mt-4 text-dark-500">Đang tải...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl overflow-hidden">
                {/* Order Header */}
                <div className="p-4 border-b border-dark-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.orderCode}</p>
                    <p className="text-sm text-dark-500">{formatDate(order.createdAt)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Order Items */}
                <div className="p-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className={`flex gap-4 ${index > 0 ? 'mt-4 pt-4 border-t border-dark-100' : ''}`}>
                      <img
                        src={item.productImageUrl || '/placeholder-product.jpg'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg bg-sand"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-dark-900">{item.productName}</h4>
                        <p className="text-sm text-dark-500">{item.sizeName} - {item.colorName}</p>
                        <p className="text-sm text-dark-500">x{item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-sand flex items-center justify-between">
                  <p className="text-dark-600">
                    {order.totalItems} sản phẩm
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-dark-500">Tổng tiền:</p>
                      <p className="text-xl font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <Link
                      to={`/orders/track/${order.orderCode}`}
                      className="btn-outline text-sm"
                    >
                      Chi tiết
                    </Link>
                    {(order.status === 'PENDING' || order.status === 'PAID') && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn text-sm bg-red-500 text-white hover:bg-red-600"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-outline px-4 py-2 disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-outline px-4 py-2 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-20 h-20 text-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-700 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-dark-500 mb-6">
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Bạn chưa có đơn hàng nào trong mục này'
              }
            </p>
            <Link to="/products" className="btn-primary">
              Mua sắm ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
