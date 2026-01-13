import api from './api'

const createOrder = async (orderData) => {
  // api interceptor automatically adds Authorization token and X-Cart-Session
  const response = await api.post('/orders', orderData)
  return response.data.data
}

const getMyOrders = async (status = null, page = 0, size = 10) => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  params.append('page', page)
  params.append('size', size)
  
  const response = await api.get(`/orders/my-orders?${params.toString()}`)
  return response.data.data
}

const getOrderByCode = async (orderCode) => {
  const response = await api.get(`/orders/track/${orderCode}`)
  return response.data.data
}

const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data.data
}

const cancelOrder = async (orderId, reason = '') => {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
  const response = await api.post(`/orders/${orderId}/cancel${params}`)
  return response.data.data
}

const getGuestOrders = async (email, page = 0, size = 10) => {
  const response = await api.get(`/orders/guest?email=${encodeURIComponent(email)}&page=${page}&size=${size}`)
  return response.data.data
}

const orderService = {
  createOrder,
  getMyOrders,
  getOrderByCode,
  getOrderById,
  cancelOrder,
  getGuestOrders,
}

export default orderService

