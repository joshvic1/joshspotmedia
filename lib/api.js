import axios from "axios";

const api = axios.create({
  baseURL: "", // same-origin
  withCredentials: true, // keep this
});

export default api;
