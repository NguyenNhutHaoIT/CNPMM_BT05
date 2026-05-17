import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/v1/api',
  timeout: 10000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err);
    return Promise.reject(err.response?.data || err.message || 'Lỗi kết nối');
  }
);

export default instance;