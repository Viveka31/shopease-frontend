import axios from 'axios';

// In development: proxy in package.json handles /api → localhost:5000
// In production:  set REACT_APP_API_URL to your Render backend URL
const baseURL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopease_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-clear token on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shopease_token');
      localStorage.removeItem('shopease_user');
    }
    return Promise.reject(err);
  }
);

export default api;
