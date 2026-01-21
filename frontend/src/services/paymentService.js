import api from './api'

const createPayment = async (orderId, amount) => {
  console.log('Creating payment for orderId:', orderId, 'amount:', amount)
  const response = await api.post('/payments/create', {
    orderId,
    amount
  })
  console.log('Full payment response:', response)
  console.log('Response data:', response.data)
  console.log('Payment data:', response.data.data)
  console.log('QR Code in response:', response.data.data?.qrCode ? 'Present' : 'Missing')
  return response.data.data
}

const getPaymentByOrderId = async (orderId) => {
  const response = await api.get(`/payments/order/${orderId}`)
  return response.data.data
}

const paymentService = {
  createPayment,
  getPaymentByOrderId,
}

export default paymentService
