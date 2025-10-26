"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { toast } from "sonner";

// ✅ Helper to compute grand total if not found in DB
const calculateGrandTotal = (items = []) => {
  return items.reduce(
    (sum, it) => sum + Number(it.finalWithBonus || it.totalSalary || 0),
    0
  );
};

export default function SalaryBatches() {
  const [batches, setBatches] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;

  const load = async (p = 1) => {
    try {
      const { data } = await api.get("/api/payout/saved", {
        params: { page: p, pageSize },
      });

      // ✅ Ensure latest saved batch shows first
      const sorted = (data.items || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBatches(sorted);
      setPage(data.page);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load payouts");
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const hasMore = page * pageSize < total;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-semibold mb-6">Payouts</h1>

        {batches.length === 0 ? (
          <p className="text-gray-500">No payouts yet.</p>
        ) : (
          <div className="space-y-6">
            {batches.map((b) => {
              // ✅ calculate fallback total
              const totalBatch = b.grandTotal || calculateGrandTotal(b.items);

              return (
                <div
                  key={b._id}
                  className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Payout for {new Date(b.from).toLocaleDateString()} →
                        {new Date(b.to).toLocaleDateString()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Total:{" "}
                        <b className="text-green-600">
                          ₦{Number(totalBatch).toLocaleString()}
                        </b>
                      </p>
                    </div>
                  </div>

                  {/* Users in batch */}
                  <div className="mt-4 space-y-2 text-sm">
                    {b.items &&
                      b.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b last:border-none py-2"
                        >
                          <div className="text-gray-900">
                            {it.fullName || it.email}
                          </div>
                          <div className="text-gray-700">
                            ₦{Number(it.totalSalary || 0).toLocaleString()}{" "}
                            {it.bonus > 0 ? (
                              <span className="text-green-600">
                                + ₦{Number(it.bonus).toLocaleString()} bonus
                              </span>
                            ) : (
                              <span className="text-gray-400">(no bonus)</span>
                            )}{" "}
                            ={" "}
                            <b className="text-gray-900">
                              ₦{Number(it.finalWithBonus || 0).toLocaleString()}
                            </b>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => load(page + 1)}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Load more
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
