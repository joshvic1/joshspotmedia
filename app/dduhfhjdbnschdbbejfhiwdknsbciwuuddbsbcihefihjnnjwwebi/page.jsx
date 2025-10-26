"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/authStore";
import api from "@/lib/api";
import { toast } from "sonner";
import { SALARY_CONFIG } from "@/config/salaryConfig"; // ✅ IMPORT GLOBAL SALARY RULES

// ✅ Presets remain same
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

// ✅ Date Utils
function rangeForPreset(key) {
  const now = new Date();
  const d = (val) => val.toISOString().slice(0, 10);
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

  // ✅ Fetch payout data
  const compute = async () => {
    if (!from || !to) return toast.error("Select valid date");
    try {
      setLoading(true);
      const { data } = await api.get("/api/payout/compute", {
        params: { from, to },
      });
      setResult(data);
      toast.success("Payout calculated ✅");
    } catch {
      toast.error("Failed to compute");
    } finally {
      setLoading(false);
    }
  };

  // ✅ View user breakdown
  const viewUserDetails = async (userId) => {
    setExpandedUser(userId);
    try {
      const { data } = await api.get("/api/daily", {
        params: { page: 1, pageSize: 100, userId, from, to },
      });
      setUserRecords(data.items || []);
    } catch {
      toast.error("Failed to load user details");
    }
  };

  // ✅ Save payout batch
  const saveBatch = async () => {
    if (!result?.items?.length) return toast.error("Nothing to save");
    try {
      await api.post("/api/payout/save", { from, to, items: result.items });
      toast.success("Saved to database ✅");
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        <h1 className="text-2xl font-semibold mb-6">Manual Payout Compute</h1>

        {/* ✅ Filter controls */}
        {/* ... keep same */}

        {/* ✅ Render Results */}
        {result && (
          <section className="bg-white rounded-xl shadow p-5 border">
            {/* Header section */}
            {/* ... keep same */}

            {/* ✅ User Records Table */}
            {/* (unchanged except salary display is backend-controlled) */}

            {/* ✅ Expanded User Details */}
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
                    {userRecords.map((r) => {
                      // ✅ Live Calculation using Global Config
                      const conv = Number(r.conversations) || 0;
                      const first = Number(r.avgFirstResponse) || 0;
                      const resp = Number(r.avgResponseTime) || 0;
                      const unr = Number(r.unrepliedChats) || 0;

                      const base = conv * SALARY_CONFIG.PAY_PER_CONVERSATION;
                      const combined = (first + resp) / 2;
                      let penalty =
                        combined > SALARY_CONFIG.RESPONSE_TIME_THRESHOLD
                          ? Math.ceil(
                              (combined -
                                SALARY_CONFIG.RESPONSE_TIME_THRESHOLD) /
                                5
                            ) * SALARY_CONFIG.LATE_RESPONSE_PENALTY
                          : 0;
                      penalty += unr * SALARY_CONFIG.UNREPLIED_PENALTY;

                      const final = Math.max(base - penalty, 0);

                      return (
                        <div
                          key={r._id}
                          className="bg-gray-50 border rounded-lg p-3"
                        >
                          <div className="flex justify-between">
                            <span>{new Date(r.date).toLocaleDateString()}</span>
                            <span className="font-semibold text-green-600">
                              ₦{final.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Conv: {conv} • 1st: {first}m • Resp: {resp}m •
                            Combined: {combined.toFixed(2)}m • Unreplied: {unr}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
