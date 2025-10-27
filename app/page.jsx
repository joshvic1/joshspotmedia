"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authStore";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import api from "@/lib/api";
import { toast } from "sonner";
import RecordCard from "@/components/RecordCard";
import NoticeBar from "@/components/NoticeBar";
import LoadingSpinner from "@/components/LoadingSpinner"; // ✅ Import spinner

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingRecords, setLoadingRecords] = useState(true); // ✅ New
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 7;
  const hasMore = records.length < total;
  const { user, loading, fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) {
      loadRecords(1, true);
    }
  }, [user]);

  const loadRecords = async (pageNo = 1, reset = false) => {
    try {
      if (reset) setLoadingRecords(true);
      const { data } = await api.get("/api/daily", {
        params: { page: pageNo, pageSize },
      });
      setTotal(data.total);
      setPage(data.page);
      if (reset) setRecords(data.items);
      else setRecords((prev) => [...prev, ...data.items]);
    } catch {
      toast.error("Failed to load records");
    } finally {
      if (reset) setLoadingRecords(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LoginModal open={!loading && !user} />

      {user && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h1>

          <p className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 mb-6">
            👋 Welcome back, <span className="font-medium">{user.email}</span>
          </p>

          <NoticeBar storageKey="home-top-notice" ttlMs={24 * 60 * 60 * 1000}>
            <b>Note</b> This dashboard displays all onboarded users daily
            earning records. Always updated between <b>10 PM - 7 AM</b>.{" "}
            <u>
              <a href="/note">See your work days for this week here</a>
            </u>
          </NoticeBar>

          {/* ✅ Proper loading state */}
          {loadingRecords ? (
            <LoadingSpinner />
          ) : records.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No salary records yet.
            </p>
          ) : (
            <div className="space-y-4">
              {records
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((record) => (
                  <RecordCard key={record._id} record={record} />
                ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={async () => {
                  setLoadingMore(true);
                  await loadRecords(page + 1);
                  setLoadingMore(false);
                }}
                className="px-6 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
