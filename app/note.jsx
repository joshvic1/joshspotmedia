"use client";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/authStore";
import api from "@/lib/api";
import { toast } from "sonner";

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
  const d = (date) => date.toISOString().slice(0, 10);

  const firstDayOfMonth = (y, m) => new Date(y, m, 1);
  const lastDayOfMonth = (y, m) => new Date(y, m + 1, 0, 23, 59, 59, 999);

  switch (key) {
    case "today":
      return { from: d(now), to: d(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: d(y), to: d(y) };
    }
    case "last3": {
      const s = new Date(now);
      s.setDate(s.getDate() - 2);
      return { from: d(s), to: d(now) };
    }
    case "last7": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { from: d(s), to: d(now) };
    }
    case "last30": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { from: d(s), to: d(now) };
    }
    case "thisMonth": {
      const s = firstDayOfMonth(now.getFullYear(), now.getMonth());
      const e = lastDayOfMonth(now.getFullYear(), now.getMonth());
      return { from: d(s), to: d(e) };
    }
    case "lastMonth": {
      const m = now.getMonth() - 1;
      const y = m < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const mm = (m + 12) % 12;
      const s = firstDayOfMonth(y, mm);
      const e = lastDayOfMonth(y, mm);
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

  // Handle preset change
  useEffect(() => {
    if (preset !== "custom") {
      const r = rangeForPreset(preset);
      setFrom(r.from);
      setTo(r.to);
    }
  }, [preset]);

  const compute = async () => {
    if (!from || !to) return toast.error("Select a valid date range");
    try {
      setLoading(true);
      const { data } = await api.get("/api/payout/compute", {
        params: { from, to },
      });
      setResult(data);
      toast.success("Payout computed");
    } catch (e) {
      toast.error("Failed to compute");
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      setExpandedUser(userId);
      const { data } = await api.get("/api/daily", {
        params: {
          page: 1,
          pageSize: 100,
          from,
          to,
          userId,
        },
      });
      setUserRecords(data.items || []);
    } catch {
      toast.error("Could not load user details");
    }
  };

  const saveBatch = async () => {
    if (!result || !Array.isArray(result.items) || result.items.length === 0) {
      return toast.error("Nothing to save");
    }

    try {
      const payload = {
        from,
        to,
        items: result.items, // ✅ send all user payout data
      };

      await api.post("/api/payout/save", payload);
      toast.success("Saved to database ✅");
    } catch (e) {
      toast.error("Save failed: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Manual Payout Compute
        </h1>

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
        {result ? (
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
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
                    ₦{result.grandTotal.toLocaleString()}
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
                        <div className="text-xs text-gray-500">{u.email}</div>
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
                        ₦{u.totalSalary.toLocaleString()}
                      </td>
                      <td
                        className={`py-2 ${
                          u.bonus > 0 ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {u.bonus > 0 ? `₦${u.bonus.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-2 font-semibold text-gray-900">
                        ₦{u.finalWithBonus.toLocaleString()}
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

              {/* User details drawer */}
              {expandedUser && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">
                      User Details (in range)
                    </h3>
                    <button
                      onClick={() => {
                        setExpandedUser(null);
                        setUserRecords([]);
                      }}
                      className="text-gray-600 hover:underline text-sm"
                    >
                      Close
                    </button>
                  </div>
                  {userRecords.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No records for this user in the selected range.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {userRecords
                        .slice()
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((r) => {
                          // ✅ Force Recalculate Daily Salary
                          const conv = Number(r.conversations) || 0;
                          const first = Number(r.avgFirstResponse) || 0;
                          const resp = Number(r.avgResponseTime) || 0;
                          const unr = Number(r.unrepliedChats) || 0;

                          const base = conv * 20;
                          const combined = (first + resp) / 2;
                          let penalty = 0;
                          if (combined > 5) {
                            penalty += Math.ceil((combined - 5) / 5) * 2000;
                          }
                          penalty += unr * 50;
                          const dailySalary = Math.max(base - penalty, 0);

                          return (
                            <div
                              key={r._id}
                              className="bg-white border rounded-lg p-3 text-sm shadow-sm hover:shadow-md transition"
                            >
                              <div className="flex justify-between">
                                <div className="text-gray-800">
                                  {new Date(r.date).toLocaleDateString()}
                                </div>
                                <div className="font-semibold text-green-600">
                                  ₦{dailySalary.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-gray-600">
                                Conv: <b>{conv}</b> • 1st: <b>{first}m</b> •
                                Resp: <b>{resp}m</b> • Combined:{" "}
                                <b>{combined.toFixed(2)}m</b> • Unreplied:{" "}
                                <b>{unr}</b>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
