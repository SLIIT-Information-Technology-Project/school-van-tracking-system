import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

<<<<<<< HEAD
<<<<<<< HEAD
// ─────────────────────────────────────────────────────────
// API Base URL (Update to your current machine IP)
// ─────────────────────────────────────────────────────────
const LOCAL_IP = '192.168.43.98'; 
const API_URL = `http://${LOCAL_IP}:5000/api`;
=======
const API_URL = 'http://192.168.1.175:5000/api';
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
=======
const API_URL = 'http://192.168.8.184:5000/api';
>>>>>>> 8345793247d59b57b29551b213dd1a3e990c365a

// Create the Axios HTTP client with the base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds before giving up on a request
});


api.interceptors.request.use(
  async (config) => {
    // Check for any of the three possible saved tokens (driver, parent, attendant)
    const driverToken = await AsyncStorage.getItem('driverToken');
    const parentToken = await AsyncStorage.getItem('parentToken');
    const attendantToken = await AsyncStorage.getItem('attendantToken');

    // Use whichever token is available
    const token = driverToken || parentToken || attendantToken;

    if (token) {
      // Attach token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;
