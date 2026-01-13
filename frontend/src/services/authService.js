import api from './api'

const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  if (response.data.data) {
    localStorage.setItem('token', response.data.data.accessToken)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))
  }
  return response.data.data
}

const login = async (userData) => {
  const response = await api.post('/auth/login', userData)
  if (response.data.data) {
    localStorage.setItem('token', response.data.data.accessToken)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))
  }
  return response.data.data
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data.data
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
}

export default authService

