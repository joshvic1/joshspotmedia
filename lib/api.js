// frontend/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000",
  withCredentials: true, // important to send cookies (JWT)
});

export default api;
