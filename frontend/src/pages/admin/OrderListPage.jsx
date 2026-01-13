import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const OrderListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, order: null });
  const [newStatus, setNewStatus] = useState('');

  const statusFilters = [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SHIPPING', label: 'Đang giao hàng' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const page = searchParams.get('page') || 0;
      const status = searchParams.get('status') || '';
      const search = searchParams.get('search') || '';
      
      let url = `/admin/orders?page=${page}&size=10`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;
      
      const response = await api.get(url);
      const data = response.data?.data;
      
      setOrders(data?.content || []);
      setPagination({
        page: data?.number || 0,
        size: data?.size || 10,
        totalElements: data?.totalElements || 0,
        totalPages: data?.totalPages || 0,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    const params = Object.fromEntries(searchParams);
    if (status) {
      params.status = status;
    } else {
      delete params.status;
    }
    params.page = 0;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage });
  };

  const handleUpdateStatus = async () => {
    if (!statusModal.order || !newStatus) return;
    
    try {
      await api.put(`/admin/orders/${statusModal.order.id}/status`, { status: newStatus });
      setStatusModal({ open: false, order: null });
      setNewStatus('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPING: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ xử lý',
      PAID: 'Đã thanh toán',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao hàng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền',
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600">Tổng cộng {pagination.totalElements} đơn hàng</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (searchParams.get('status') || '') === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thanh toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">#{order.orderCode}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.recipientName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.recipientPhone || order.guestEmail || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setStatusModal({ open: true, order });
                              setNewStatus(order.status);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Cập nhật trạng thái"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Detail Expanded */}
            {selectedOrder && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="max-w-4xl">
                  <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng #{selectedOrder.orderCode}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Info */}
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin giao hàng</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Người nhận:</span> {selectedOrder.recipientName}</p>
                        <p><span className="text-gray-500">SĐT:</span> {selectedOrder.recipientPhone}</p>
                        <p><span className="text-gray-500">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                        {selectedOrder.notes && (
                          <p><span className="text-gray-500">Ghi chú:</span> {selectedOrder.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Tổng quan đơn hàng</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tạm tính:</span>
                          <span>{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phí vận chuyển:</span>
                          <span>{formatCurrency(selectedOrder.shippingFee || 0)}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Giảm giá:</span>
                            <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Tổng cộng:</span>
                          <span className="text-blue-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="mt-4 bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Sản phẩm ({selectedOrder.items.length})</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 py-2 border-b last:border-0">
                            <img
                              src={item.productImage || '/placeholder.jpg'}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-500">
                                {item.sizeName} / {item.colorName} x {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                              <p className="text-sm text-gray-500">{formatCurrency(item.price)}/sp</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Hiển thị {pagination.page * pagination.size + 1} -{' '}
                  {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} trong{' '}
                  {pagination.totalElements} đơn hàng
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-500">Đơn hàng sẽ xuất hiện ở đây khi có khách đặt</p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setStatusModal({ open: false, order: null })} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Cập nhật trạng thái đơn hàng
              </h3>
              <p className="text-gray-600 mb-4">
                Đơn hàng: <strong>#{statusModal.order?.orderCode}</strong>
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái mới
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStatusModal({ open: false, order: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;


