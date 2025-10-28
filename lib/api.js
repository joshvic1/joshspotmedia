// frontend/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://joshspotmedia-backup-production.up.railway.app",
  withCredentials: true, // important to send cookies (JWT)
});

export default api;
