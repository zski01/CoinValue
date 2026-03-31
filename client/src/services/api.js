// src/services/api.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000', // your backend URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('coinvault_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = (data) => API.post('/register', data)
export const loginUser = (data) => API.post('/login', data)
export const getProfile = () => API.get('/profile')
export const updateUserData = (data) => API.post('/user-data', data) // for watchlist/portfolio
export const getTransactions = () => API.get('/transactions')
export const addTransaction = (data) => API.post('/transactions', data)
export const getUserData = () => API.get('/user-data')
export const updateUserData = (data) => API.post('/user-data', data)

export default API