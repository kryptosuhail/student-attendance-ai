import axios from 'axios';

const api = axios.create({
  // Vite proxy will redirect '/api' to 'http://localhost:5000/api'
  baseURL: '/api', 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
