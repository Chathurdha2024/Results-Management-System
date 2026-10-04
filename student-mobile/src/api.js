import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 12000 });

api.interceptors.request.use(async (config) => {
  // A storage failure must not fake a network error: send the request
  // unauthenticated and let the server answer truthfully.
  try {
    const token = await AsyncStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Server rejections carry a message; transport failures (wrong URL, phone off
// the PC's Wi-Fi, backend down) have no response at all and must never be
// reported as bad credentials.
export function apiErrorMessage(err, fallback) {
  if (err.response?.data?.error) return err.response.data.error;
  if (!err.response) {
    return `Cannot reach the server at ${API_BASE_URL}. Check that the backend is running and this phone is on the same Wi-Fi.`;
  }
  return fallback;
}

export const authApi = {
  login: (regNo, password) =>
    api.post('/api/auth/student/login', { regNo, password }),
  changePassword: (newPassword) =>
    api.post('/api/auth/student/change-password', { newPassword }),
};

export const studentApi = {
  dashboard: () => api.get('/api/student/dashboard'),
  examSchedules: () => api.get('/api/student/exam-schedules'),
  notifications: () => api.get('/api/student/notifications'),
  markNotificationsRead: () => api.post('/api/student/notifications/read'),
};

export default api;
