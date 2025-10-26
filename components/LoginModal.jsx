"use client";
import { useState } from "react";
import { useAuth } from "@/lib/authStore";
import { toast } from "sonner";

export default function LoginModal({ open }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Login successful");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-sm shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-4">Sign In</h2>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          disabled={loading}
          className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          No registration page — accounts are created by admin.
        </p>
      </form>
    </div>
  );
}
