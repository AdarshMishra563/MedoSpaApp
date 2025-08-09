import axios from 'axios';
import { Platform } from 'react-native';

import { useSelector } from 'react-redux';

const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://192.168.33.118:5000' 
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const token=useSelector(state=>state?.user?.userToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const auth = {
  currentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

export { api, auth };