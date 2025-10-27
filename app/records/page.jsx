"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import RecordCard from "@/components/RecordCard";
import LoadingSpinner from "@/components/LoadingSpinner"; // ✅ Added
import api from "@/lib/api";
import { useAuth } from "@/lib/authStore";
import { toast } from "sonner";
import { exportToExcel } from "@/utils/exportToExcel.";

export default function RecordsPage() {
  const { user, loading, fetchMe } = useAuth();
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ NEW

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [users, setUsers] = useState([]);

  const pageSize = 7;
  const hasMore = records.length < total;

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUsers();
      loadRecords(1, true);
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/api/users");
      setUsers(data);
    } catch {}
  };

  const loadRecords = async (pageNo = 1, reset = false) => {
    try {
      if (reset) setIsLoading(true); // ✅ Spinner on initial or filter load
      const { data } = await api.get("/api/daily", {
        params: {
          page: pageNo,
          pageSize,
          from: from || undefined,
          to: to || undefined,
          userId: filterUser || undefined,
        },
      });

      const sorted = data.items.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTotal(data.total);
      setPage(data.page);

      if (reset) setRecords(sorted);
      else setRecords((prev) => [...prev, ...sorted]);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = async () => {
    await loadRecords(1, true);
    toast.success("Filtered!");
  };

  const handleExport = () => {
    if (records.length === 0) return toast.error("No data to export");
    const clean = records.map((r) => ({
      Date: new Date(r.date).toLocaleDateString(),
      User: r.user?.fullName || r.user?.email,
      Conversations: r.conversations,
      "Avg First RT (mins)": r.avgFirstResponse ?? 0,
      "Avg Response (mins)": r.avgResponseTime ?? 0,
      "Combined RT (mins)":
        r.combinedAvgResponseTime ??
        ((Number(r.avgFirstResponse) + Number(r.avgResponseTime)) / 2).toFixed(
          2
        ),
      Unreplied: r.unrepliedChats ?? 0,
      Salary: r.finalSalary ?? 0,
    }));
    exportToExcel(clean, "salary_records.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LoginModal open={!loading && !user} />

      {user && (
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-10">
          <h1 className="text-2xl font-semibold mb-6">Daily Salary Records</h1>

          {/* ✅ FILTER SECTION (UNCHANGED, STILL AT TOP) */}
          <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label>From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label>To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label>User</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="">All</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  className="w-full bg-black text-white py-2 rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export to Excel
          </button>

          {/* ✅ Loading Spinner for first load */}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Records Display */}
              <div className="space-y-4">
                {records.map((record) => (
                  <RecordCard key={record._id} record={record} />
                ))}
              </div>

              {/* ✅ Load More Spinner */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={async () => {
                      setLoadingMore(true);
                      await loadRecords(page + 1);
                      setLoadingMore(false);
                    }}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      )}
    </div>
  );
}
