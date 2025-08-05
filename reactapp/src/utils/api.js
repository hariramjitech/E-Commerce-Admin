// src/utils/api.js
import axios from 'axios';
const BASE_URL = 'https://ide-becabbbccbbfdfebebacdbf.premiumproject.examly.io/proxy/8080/api';

// const BASE_URL = 'http://localhost:8080/api';

// 🔁 Products
export const fetchProducts = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.stockStatus && filters.stockStatus !== 'all') params.append('stockStatus', filters.stockStatus);

  return axios.get(`${BASE_URL}/products?${params.toString()}`);
};

export const getProduct = (id) => axios.get(`${BASE_URL}/products/${id}`);
export const createProduct = (data) => axios.post(`${BASE_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${BASE_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${BASE_URL}/products/${id}`);

// 🔁 Orders
export const fetchOrders = () => axios.get(`${BASE_URL}/orders`);
export const getOrder = (id) => axios.get(`${BASE_URL}/orders/${id}`);
export const createOrder = (data) => axios.post(`${BASE_URL}/orders`, data);
export const updateOrderStatus = (id, status) => axios.patch(`${BASE_URL}/orders/${id}/status`, { status });
export const deleteOrder = (id) => axios.delete(`${BASE_URL}/orders/${id}`);
