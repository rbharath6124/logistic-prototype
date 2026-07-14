import axios from 'axios';

// Get token from localStorage if available
const token = localStorage.getItem('token');

export const apiClient = axios.create({
  baseURL: 'https://logistic-prototype.onrender.com/api', // Adjust in production
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete apiClient.defaults.headers['Authorization'];
    localStorage.removeItem('token');
  }
};

// Intercept 401 errors to automatically redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      setAuthToken('');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
