"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/lib/authStore";
import api from "@/lib/api";
import { toast } from "sonner";

/** Fallback calculator (mirrors backend rules) */
function calcDaily(conversations, avgFirst, avgResp, unreplied) {
  const PAY_PER_CONV = 20;
  const LATE_BLOCK = 2000;
  const THRESHOLD = 5;
  const UNREPLIED_PENALTY = 500;

  const conv = Number(conversations) || 0;
  const first = Number(avgFirst) || 0;
  const resp = Number(avgResp) || 0;
  const unr = Number(unreplied) || 0;

  const base = conv * PAY_PER_CONV;
  const combined = (first + resp) / 2;
  let penalty = 0;
  if (combined > THRESHOLD) {
    penalty += Math.ceil((combined - THRESHOLD) / 5) * LATE_BLOCK;
  }
  penalty += unr * UNREPLIED_PENALTY;

  return {
    combined: Number(combined.toFixed(2)),
    final: Math.max(base - penalty, 0),
  };
}

export default function SummaryPage() {
  const { user, loading, fetchMe } = useAuth();
  const [users, setUsers] = useState([]);
  const [summaryUser, setSummaryUser] = useState("");
  const [summaryFrom, setSummaryFrom] = useState("");
  const [summaryTo, setSummaryTo] = useState("");

  const [apiSummary, setApiSummary] = useState(null);
  const [verified, setVerified] = useState(null); // client-verified totals
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/api/users");
      setUsers(data);
    } catch {
      /* ignore */
    }
  };

  const handleSummary = async () => {
    if (!summaryFrom || !summaryTo || !summaryUser) {
      toast.error("Select user and date range");
      return;
    }
    try {
      // 1) Ask backend for its summary
      const { data } = await api.get("/api/daily/summary", {
        params: { userId: summaryUser, from: summaryFrom, to: summaryTo },
      });
      setApiSummary(data);
      toast.success("Summary loaded");

      // 2) Verify client-side by fetching raw records and recomputing
      setVerifying(true);
      const recRes = await api.get("/api/daily", {
        params: {
          page: 1,
          pageSize: 500, // plenty for a month+; adjust if you need more
          from: summaryFrom,
          to: summaryTo,
          userId: summaryUser,
        },
      });
      const items = recRes.data?.items || [];

      if (items.length === 0) {
        setVerified({
          daysCounted: 0,
          totalConversations: 0,
          totalSalary: 0,
          totalUnreplied: 0,
          avgCombinedResponse: "0.00",
        });
      } else {
        let totals = {
          totalConversations: 0,
          totalSalary: 0,
          totalUnreplied: 0,
          combinedSum: 0,
          daysCounted: items.length,
        };

        items.forEach((r) => {
          const conv = Number(r.conversations) || 0;
          const first = Number(r.avgFirstResponse) || 0;
          const resp = Number(r.avgResponseTime) || 0;
          const unr = Number(r.unrepliedChats) || 0;

          const daily = calcDaily(conv, first, resp, unr);
          totals.totalConversations += conv;
          totals.totalSalary += daily.final;
          totals.totalUnreplied += unr;
          // prefer stored combined if present, else our computed
          const combined =
            r.combinedAvgResponseTime !== undefined &&
            r.combinedAvgResponseTime !== null
              ? Number(r.combinedAvgResponseTime)
              : daily.combined;
          totals.combinedSum += combined;
        });

        setVerified({
          daysCounted: totals.daysCounted,
          totalConversations: totals.totalConversations,
          totalSalary: totals.totalSalary,
          totalUnreplied: totals.totalUnreplied,
          avgCombinedResponse: Number(
            (totals.combinedSum / totals.daysCounted).toFixed(2)
          ),
        });
      }
    } catch {
      toast.error("Failed to get summary");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LoginModal open={!loading && !user} />

      {user && (
        <main className="max-w-4xl mx-auto px-4 pt-20 pb-10">
          <h1 className="text-2xl font-semibold mb-6">Salary Summary</h1>

          {/* Filters */}
          <div className="bg-white border rounded-xl p-6 shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label>User</label>
                <select
                  value={summaryUser}
                  onChange={(e) => setSummaryUser(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>From</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={summaryFrom}
                  onChange={(e) => setSummaryFrom(e.target.value)}
                />
              </div>
              <div>
                <label>To</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={summaryTo}
                  onChange={(e) => setSummaryTo(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSummary}
                  className="w-full bg-black text-white py-2 rounded-md"
                >
                  {verifying ? "Calculating..." : "Calculate"}
                </button>
              </div>
            </div>

            {/* Backend summary */}
            {apiSummary && (
              <div className="mt-6 bg-gray-50 border p-4 rounded-lg text-sm">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Backend Summary
                </p>
                <p>
                  Total Conversations:{" "}
                  <b>{apiSummary.totalConversations ?? 0}</b>
                </p>
                <p>
                  Total Salary:{" "}
                  <b>₦{Number(apiSummary.totalSalary || 0).toLocaleString()}</b>
                </p>
                <p>
                  Total Unreplied: <b>{apiSummary.totalUnreplied ?? 0}</b>
                </p>
                <p>
                  Average Combined Response:{" "}
                  <b>{apiSummary.avgCombinedResponse ?? "0.00"} mins</b>
                </p>
                <p>
                  Days Counted: <b>{apiSummary.daysCounted ?? 0}</b>
                </p>
              </div>
            )}

            {/* Client verified summary */}
            {verified && (
              <div className="mt-4 bg-white border p-4 rounded-lg text-sm">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Verified (Client)
                </p>
                <p>
                  Total Conversations: <b>{verified.totalConversations}</b>
                </p>
                <p>
                  Total Salary:{" "}
                  <b>₦{Number(verified.totalSalary).toLocaleString()}</b>
                </p>
                <p>
                  Total Unreplied: <b>{verified.totalUnreplied}</b>
                </p>
                <p>
                  Average Combined Response:{" "}
                  <b>{verified.avgCombinedResponse} mins</b>
                </p>
                <p>
                  Days Counted: <b>{verified.daysCounted}</b>
                </p>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
