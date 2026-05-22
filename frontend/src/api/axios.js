import axios from 'axios';

// Lokalny backend: utwórz frontend/.env.local z VITE_API_URL=http://localhost:5091/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://cinema-api-gdansk-2026-ctd6fxgvgvdjhpbd.polandcentral-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor — automatycznie dodaje token JWT do każdego żądania
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — automatycznie obsługuje błędy 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
