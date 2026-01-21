import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut,
  ChevronRight,
  Edit2,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logout } from '../store/slices/authSlice'
import orderService from '../services/orderService'

const AccountPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/account')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchRecentOrders()
    }
  }, [user, activeTab])

  const fetchRecentOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const data = await orderService.getMyOrders(null, 0, 5) // Get first 5 orders
      setRecentOrders(data.content || [])
      
      // Extract unique addresses from orders
      const uniqueAddresses = new Map()
      data.content?.forEach(order => {
        if (order.shippingAddress) {
          const addrKey = `${order.shippingAddress.street}-${order.shippingAddress.ward}-${order.shippingAddress.district}`
          if (!uniqueAddresses.has(addrKey)) {
            uniqueAddresses.set(addrKey, {
              id: uniqueAddresses.size + 1,
              name: order.shippingAddress.fullName || user.fullName,
              phone: order.shippingAddress.phoneNumber || user.phoneNumber,
              address: `${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`,
              isDefault: uniqueAddresses.size === 0
            })
          }
        }
      })
      setAddresses(Array.from(uniqueAddresses.values()))
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Đã đăng xuất!')
    navigate('/')
  }

  if (!user) {
    return null
  }

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
    { id: 'addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
    { id: 'wishlist', label: 'Sản phẩm yêu thích', icon: Heart },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
  ]

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

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

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Thông tin cá nhân</h2>
              <button className="btn-outline text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>

            <div className="bg-sand rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.fullName}</h3>
                  <p className="text-dark-500">
                    {user.createdAt 
                      ? `Thành viên từ ${new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`
                      : 'Thành viên'
                    }
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-500">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-500">Số điện thoại</label>
                  <p className="font-medium">{user.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-500">Giới tính</label>
                  <p className="font-medium">Chưa cập nhật</p>
                </div>
                <div>
                  <label className="text-sm text-dark-500">Ngày sinh</label>
                  <p className="font-medium">Chưa cập nhật</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Đơn hàng của tôi</h2>
              <Link to="/orders" className="text-primary-500 text-sm hover:underline">
                Xem tất cả
              </Link>
            </div>

            {isLoadingOrders ? (
              <div className="text-center py-12 bg-sand rounded-xl">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-dark-500">Đang tải đơn hàng...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="bg-sand rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.orderCode}</p>
                        <p className="text-sm text-dark-500">{formatDate(order.createdAt)}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-dark-500">{order.totalItems || 0} sản phẩm</p>
                      <p className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <Link 
                      to={`/orders/track/${order.orderCode}`}
                      className="mt-3 text-sm text-primary-500 hover:underline flex items-center gap-1"
                    >
                      Xem chi tiết <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-sand rounded-xl">
                <Package className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                <p className="text-dark-500 mb-4">Bạn chưa có đơn hàng nào</p>
                <Link to="/products" className="btn-primary">
                  Mua sắm ngay
                </Link>
              </div>
            )}
          </div>
        )

      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Địa chỉ giao hàng</h2>
              <button 
                className="btn-primary text-sm flex items-center gap-2"
                onClick={() => toast('Tính năng đang phát triển', { icon: 'ℹ️' })}
              >
                <Plus className="w-4 h-4" />
                Thêm địa chỉ
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-sand rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{addr.name}</p>
                          {addr.isDefault && (
                            <span className="badge bg-primary-100 text-primary-700">Mặc định</span>
                          )}
                        </div>
                        <p className="text-sm text-dark-500">{addr.phone}</p>
                        <p className="text-sm text-dark-600 mt-1">{addr.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="p-2 text-dark-500 hover:text-primary-500"
                          onClick={() => toast('Tính năng đang phát triển', { icon: 'ℹ️' })}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-dark-500 hover:text-red-500"
                          onClick={() => toast('Tính năng đang phát triển', { icon: 'ℹ️' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-sand rounded-xl">
                <MapPin className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                <p className="text-dark-500 mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
                <p className="text-sm text-dark-400 mb-4">
                  Địa chỉ sẽ được lưu tự động khi bạn đặt hàng
                </p>
                <Link to="/products" className="btn-primary">
                  Mua sắm ngay
                </Link>
              </div>
            )}
          </div>
        )

      case 'wishlist':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold">Sản phẩm yêu thích</h2>
            <div className="text-center py-12 bg-sand rounded-xl">
              <Heart className="w-16 h-16 text-dark-300 mx-auto mb-4" />
              <p className="text-dark-500 mb-4">Chưa có sản phẩm yêu thích</p>
              <Link to="/products" className="btn-primary">
                Khám phá sản phẩm
              </Link>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold">Cài đặt tài khoản</h2>
            
            <div className="space-y-4">
              <div className="bg-sand rounded-xl p-4">
                <h3 className="font-semibold mb-3">Đổi mật khẩu</h3>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Mật khẩu hiện tại" 
                    className="input"
                  />
                  <input 
                    type="password" 
                    placeholder="Mật khẩu mới" 
                    className="input"
                  />
                  <input 
                    type="password" 
                    placeholder="Xác nhận mật khẩu mới" 
                    className="input"
                  />
                  <button className="btn-primary">Cập nhật mật khẩu</button>
                </div>
              </div>

              <div className="bg-sand rounded-xl p-4">
                <h3 className="font-semibold mb-3">Thông báo</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-dark-700">Nhận email khuyến mãi</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-dark-700">Thông báo đơn hàng</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                  </label>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <h3 className="font-semibold text-red-600 mb-2">Xóa tài khoản</h3>
                <p className="text-sm text-dark-500 mb-3">
                  Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                </p>
                <button className="text-red-500 text-sm font-medium hover:underline">
                  Xóa tài khoản của tôi
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
            Tài khoản của tôi
          </h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 sticky top-24">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-dark-700 hover:bg-sand'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <hr className="my-2 border-dark-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AccountPage

