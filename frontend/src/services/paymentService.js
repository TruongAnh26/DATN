import api from './api'

// ==================== STRIPE METHODS ====================

/**
 * Get Stripe publishable key from backend
 */
const getStripeConfig = async () => {
  const response = await api.get('/payments/stripe/config')
  return response.data.data
}

/**
 * Create Stripe PaymentIntent for card payments
 * Returns clientSecret for Stripe Elements
 */
const createStripePaymentIntent = async (orderId) => {
  console.log('Creating Stripe PaymentIntent for orderId:', orderId)
  const response = await api.post('/payments/stripe/create-payment-intent', {
    orderId
  })
  console.log('Stripe PaymentIntent response:', response.data.data)
  return response.data.data
}

/**
 * Create Stripe Checkout Session
 * Returns URL to redirect user to Stripe hosted checkout page
 */
const createStripeCheckoutSession = async (orderId) => {
  console.log('Creating Stripe Checkout Session for orderId:', orderId)
  const response = await api.post('/payments/stripe/create-checkout-session', {
    orderId
  })
  console.log('Stripe Checkout Session response:', response.data.data)
  return response.data.data
}

/**
 * Verify Stripe payment status
 */
const verifyStripePayment = async (paymentIntentId) => {
  const response = await api.get(`/payments/stripe/verify/${paymentIntentId}`)
  return response.data.data
}

// ==================== LEGACY METHODS ====================

const createPayment = async (orderId, amount) => {
  console.log('Creating payment for orderId:', orderId, 'amount:', amount)
  const response = await api.post('/payments/create', {
    orderId,
    amount
  })
  return response.data.data
}

const getPaymentByOrderId = async (orderId) => {
  const response = await api.get(`/payments/order/${orderId}`)
  return response.data.data
}

const paymentService = {
  // Stripe methods
  getStripeConfig,
  createStripePaymentIntent,
  createStripeCheckoutSession,
  verifyStripePayment,
  // Legacy methods
  createPayment,
  getPaymentByOrderId,
}

export default paymentService
