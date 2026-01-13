import api from './api'

// Generate or get session ID for guest cart
const getSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId')
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem('cartSessionId', sessionId)
  }
  return sessionId
}

const getCart = async () => {
  const sessionId = getSessionId()
  const response = await api.get('/cart', {
    headers: { 'X-Cart-Session': sessionId }
  })
  return response.data.data
}

const addToCart = async (variantId, quantity = 1) => {
  const sessionId = getSessionId()
  const response = await api.post('/cart/items', 
    { variantId, quantity },
    { headers: { 'X-Cart-Session': sessionId } }
  )
  return response.data.data
}

const updateCartItem = async (variantId, quantity) => {
  const sessionId = getSessionId()
  const response = await api.put(`/cart/items/${variantId}?quantity=${quantity}`, null, {
    headers: { 'X-Cart-Session': sessionId }
  })
  return response.data.data
}

const removeFromCart = async (variantId) => {
  const sessionId = getSessionId()
  const response = await api.delete(`/cart/items/${variantId}`, {
    headers: { 'X-Cart-Session': sessionId }
  })
  return response.data.data
}

const clearCart = async () => {
  const sessionId = getSessionId()
  const response = await api.delete('/cart', {
    headers: { 'X-Cart-Session': sessionId }
  })
  return response.data.data
}

const mergeCart = async () => {
  const sessionId = getSessionId()
  const response = await api.post('/cart/merge', null, {
    headers: { 'X-Cart-Session': sessionId }
  })
  // Clear guest session after merge
  localStorage.removeItem('cartSessionId')
  return response.data.data
}

const cartService = {
  getSessionId,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
}

export default cartService

