"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/authStore";
import api from "@/lib/api";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

const presets = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last3", label: "Last 3 days" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "custom", label: "Custom" },
];

function rangeForPreset(key) {
  const now = new Date();
  const d = (val) => val.toISOString().slice(0, 10);
  const startOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  switch (key) {
    case "today":
      return { from: d(now), to: d(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { from: d(y), to: d(y) };
    }
    case "last3": {
      const s = new Date(now);
      s.setDate(now.getDate() - 2);
      return { from: d(s), to: d(now) };
    }
    case "last7": {
      const s = new Date(now);
      s.setDate(now.getDate() - 6);
      return { from: d(s), to: d(now) };
    }
    case "last30": {
      const s = new Date(now);
      s.setDate(now.getDate() - 29);
      return { from: d(s), to: d(now) };
    }
    case "thisMonth": {
      const s = startOfMonth(now);
      const e = endOfMonth(now);
      return { from: d(s), to: d(e) };
    }
    case "lastMonth": {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const s = startOfMonth(prev);
      const e = endOfMonth(prev);
      return { from: d(s), to: d(e) };
    }
    default:
      return { from: "", to: "" };
  }
}

export default function AdminPayoutCompute() {
  const { fetchMe } = useAuth();
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState(rangeForPreset("today").from);
  const [to, setTo] = useState(rangeForPreset("today").to);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userRecords, setUserRecords] = useState([]);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (preset !== "custom") {
      const r = rangeForPreset(preset);
      setFrom(r.from);
      setTo(r.to);
    }
  }, [preset]);

  const compute = async () => {
    if (!from || !to) return toast.error("Select valid date");
    try {
      setLoading(true);
      const { data } = await api.get("/api/payout/compute", {
        params: { from, to },
      });
      setResult(data);
      setExpandedUser(null);
      setUserRecords([]);
      toast.success("Payout calculated ✅");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to compute");
    } finally {
      setLoading(false);
    }
  };

  const saveBatch = async () => {
    if (!result?.items?.length) return toast.error("Nothing to save");
    try {
      await api.post("/api/payout/save", { from, to, items: result.items });
      toast.success("Saved to database ✅");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    }
  };

  const viewUserDetails = (userId) => {
    setExpandedUser(userId);
    const selected = result?.items?.find((u) => u.user === userId);
    setUserRecords(selected?.breakdown || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        <h1 className="text-2xl font-semibold mb-6">Manual Payout Compute</h1>

        {/* Filters */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Preset</label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {presets.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={preset !== "custom"}
                className="mt-1 w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={preset !== "custom"}
                className="mt-1 w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={compute}
                disabled={loading}
                className="w-full bg-gray-900 text-white rounded-lg h-10 hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Computing..." : "Calculate Total Payout"}
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        {loading && <LoadingSpinner />}

        {result && !loading && (
          <section className="bg-white rounded-xl shadow p-5 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  From <b>{new Date(result.from).toLocaleDateString()}</b> to{" "}
                  <b>{new Date(result.to).toLocaleDateString()}</b> — Users:{" "}
                  <b>{result.countUsers}</b>
                </p>
                <p className="text-base text-gray-900 mt-1">
                  Total Payout (incl. bonus):{" "}
                  <b className="text-green-600">
                    ₦{Number(result.grandTotal || 0).toLocaleString()}
                  </b>
                </p>
              </div>
              <button
                onClick={saveBatch}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Save to Database
              </button>
            </div>

            {!result.items || result.items.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                No payout data found for this range.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2">User</th>
                        <th className="py-2">Conversations</th>
                        <th className="py-2">Avg 1st</th>
                        <th className="py-2">Avg Resp</th>
                        <th className="py-2">Combined</th>
                        <th className="py-2">Unreplied</th>
                        <th className="py-2">Salary</th>
                        <th className="py-2">Bonus</th>
                        <th className="py-2">Final</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.items.map((u) => (
                        <tr key={u.user} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4">
                            <div className="font-medium">
                              {u.fullName || u.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          </td>
                          <td className="py-2">{u.totalConversations}</td>
                          <td
                            className={`py-2 ${
                              u.avgFirstResponse > 5
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {u.avgFirstResponse}m
                          </td>
                          <td
                            className={`py-2 ${
                              u.avgResponseTime > 5
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {u.avgResponseTime}m
                          </td>
                          <td
                            className={`py-2 ${
                              u.avgCombinedResponse > 5
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {u.avgCombinedResponse}m
                          </td>
                          <td className="py-2">{u.totalUnreplied}</td>
                          <td className="py-2">
                            ₦{Number(u.totalSalary || 0).toLocaleString()}
                          </td>
                          <td
                            className={`py-2 ${
                              u.bonus > 0 ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {u.bonus > 0
                              ? `₦${Number(u.bonus).toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="py-2 font-semibold text-gray-900">
                            ₦{Number(u.finalWithBonus || 0).toLocaleString()}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => viewUserDetails(u.user)}
                              className="text-blue-600 hover:underline"
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {expandedUser && (
                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">User Daily Breakdown</h3>
                      <button
                        onClick={() => setExpandedUser(null)}
                        className="text-gray-500 text-sm hover:underline"
                      >
                        Close
                      </button>
                    </div>

                    {userRecords.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No records in this range.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userRecords.map((r) => (
                          <div
                            key={`${r.date}-${r.finalSalary}`}
                            className="bg-gray-50 border rounded-lg p-3"
                          >
                            <div className="flex justify-between">
                              <span>
                                {new Date(r.date).toLocaleDateString()}
                              </span>
                              <span className="font-semibold text-green-600">
                                ₦{Number(r.finalSalary || 0).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">
                              Conv: {r.conversations} • 1st: {r.avgFirst}m •
                              Resp: {r.avgResp}m • Combined:{" "}
                              {Number(r.combined).toFixed(2)}m • Unreplied:{" "}
                              {r.unreplied}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
