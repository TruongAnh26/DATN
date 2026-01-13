import api from './api'

const getProducts = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.keyword) params.append('keyword', filters.keyword)
  if (filters.categoryIds) filters.categoryIds.forEach(id => params.append('categoryIds', id))
  if (filters.brandIds) filters.brandIds.forEach(id => params.append('brandIds', id))
  if (filters.gender) params.append('gender', filters.gender)
  if (filters.minPrice) params.append('minPrice', filters.minPrice)
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
  if (filters.onSale) params.append('onSale', filters.onSale)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
  if (filters.page !== undefined) params.append('page', filters.page)
  if (filters.size) params.append('size', filters.size)

  const response = await api.get(`/products?${params.toString()}`)
  return response.data.data
}

const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/slug/${slug}`)
  return response.data.data
}

const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`)
  return response.data.data
}

const getFeaturedProducts = async (page = 0, size = 8) => {
  const response = await api.get(`/products/featured?page=${page}&size=${size}`)
  return response.data.data
}

const getNewArrivals = async (page = 0, size = 8) => {
  const response = await api.get(`/products/new-arrivals?page=${page}&size=${size}`)
  return response.data.data
}

const getSaleProducts = async (page = 0, size = 8) => {
  const response = await api.get(`/products/on-sale?page=${page}&size=${size}`)
  return response.data.data
}

const getRelatedProducts = async (productId, page = 0, size = 4) => {
  const response = await api.get(`/products/${productId}/related?page=${page}&size=${size}`)
  return response.data.data
}

const getProductsByCategory = async (slug, page = 0, size = 12) => {
  const response = await api.get(`/products/category/${slug}?page=${page}&size=${size}`)
  return response.data.data
}

const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data.data
}

const productService = {
  getProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
  getRelatedProducts,
  getProductsByCategory,
  getCategories,
}

export default productService

