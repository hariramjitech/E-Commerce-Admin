import axios from 'axios';
// const BASE_URL = 'https://ide-becabbbccbbfdfebebacdbf.premiumproject.examly.io/proxy/8080/api';

// Auto-switch between localhost and Examly proxy
const BASE_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8080/api"
  : "https://ide-becabbbccbbfdfebebacdbf.premiumproject.examly.io/proxy/8080/api";

// Product APIs
export const fetchProducts = () => axios.get(`${BASE_URL}/products`);
export const getProduct = (id) => axios.get(`${BASE_URL}/products/${id}`);
export const createProduct = (data) => axios.post(`${BASE_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${BASE_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${BASE_URL}/products/${id}`);

// Order APIs
export const fetchOrders = () => axios.get(`${BASE_URL}/orders`);
export const getOrder = (id) => axios.get(`${BASE_URL}/orders/${id}`);
export const createOrder = (data) => axios.post(`${BASE_URL}/orders`, data);
export const updateOrderStatus = (id, status) =>
  axios.patch(`${BASE_URL}/orders/${id}/status`, { status });
export const deleteOrder = (id) => axios.delete(`${BASE_URL}/orders/${id}`);
