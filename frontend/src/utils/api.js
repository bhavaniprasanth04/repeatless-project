import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://repeatless-project-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
