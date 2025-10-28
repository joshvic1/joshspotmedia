// frontend/lib/authStore.js
import { create } from "zustand";
import api from "./api";

export const useAuth = create((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    await api.post("/api/auth/login", { email, password });

    // 🔥 Wait a moment to allow cookie to be stored
    await new Promise((resolve) => setTimeout(resolve, 300));

    const { data } = await api.get("/api/auth/me");
    set({ user: data });
  },

  logout: async () => {
    await api.post("/api/auth/logout");
    set({ user: null });
  },
}));
