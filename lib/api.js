// frontend/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://joshspotmedia-backup.onrender.com/",
  withCredentials: true, // important to send cookies (JWT)
});

export default api;
