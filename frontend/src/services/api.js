import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.headers.common['Content-Type'] = 'application/json';

let unauthorizedNotified = false;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (!unauthorizedNotified) {
        unauthorizedNotified = true;
        toast.error('Session expired. Please sign in again.');
        setTimeout(() => { unauthorizedNotified = false; }, 1500);
      }
      localStorage.removeItem('medicare_token');
      delete axios.defaults.headers.common.Authorization;
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

