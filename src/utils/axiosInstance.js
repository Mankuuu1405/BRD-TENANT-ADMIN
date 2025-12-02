import axios from 'axios';

// .env फाइल से बेस URL लें (जैसे: http://127.0.0.1:8000)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: हर रिक्वेस्ट में टोकन जोड़ें
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: अगर 401 (Unauthorized) आये तो लॉगआउट करें
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // टोकन एक्सपायर या गलत है
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth'); // पुराने लॉजिक के लिए
      window.location.href = '/'; // लॉगिन पेज पर भेजें
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;