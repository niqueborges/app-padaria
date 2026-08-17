import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Interceptor para injetar token JWT armazenado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@padaria:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@padaria:token');
      localStorage.removeItem('@padaria:user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
