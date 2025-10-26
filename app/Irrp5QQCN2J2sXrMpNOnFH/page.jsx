"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/authStore";
import api from "@/lib/api";
import { toast } from "sonner";
import RecordCard from "@/components/RecordCard";
import Link from "next/link";
import { SALARY_CONFIG } from "@/config/salaryConfig";

// ✅ Salary Calculation (uses config)
const calcSalary = (conversations, avgFirst, avgResp, unreplied) => {
  const conv = Number(conversations) || 0;
  const first = Number(avgFirst) || 0;
  const resp = Number(avgResp) || 0;
  const unr = Number(unreplied) || 0;

  const base = conv * SALARY_CONFIG.PAY_PER_CONVERSATION;
  const combined = (first + resp) / 2;

  let penalty = 0;
  if (combined > SALARY_CONFIG.RESPONSE_TIME_THRESHOLD) {
    penalty +=
      Math.ceil((combined - SALARY_CONFIG.RESPONSE_TIME_THRESHOLD) / 5) *
      SALARY_CONFIG.LATE_RESPONSE_PENALTY;
  }
  penalty += unr * SALARY_CONFIG.UNREPLIED_PENALTY;

  return { combined: combined.toFixed(2), final: Math.max(base - penalty, 0) };
};

// ✅ Create a new empty row
const createRow = () => ({
  _id: crypto.randomUUID(),
  userId: "",
  conversations: "",
  avgFirst: "",
  avgResp: "",
  unreplied: "",
});

export default function AdminUpload() {
  const { user, fetchMe } = useAuth();

  // 🔹 Input rows (unsaved)
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [users, setUsers] = useState([]);

  // 🔹 Saved Records (paginated)
  const [records, setRecords] = useState([]);
  const [recPage, setRecPage] = useState(1);
  const [recTotal, setRecTotal] = useState(0);
  const recPageSize = 10;
  const [recLoading, setRecLoading] = useState(false);
  const hasMore = recPage * recPageSize < recTotal;

  // 🔹 Sorting
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

  // ✅ Use sortedRecords everywhere (display + bulk + delete)
  const sortedRecords = [...records].sort((a, b) => {
    // Use createdAt for accurate ordering (includes time)
    const d1 = new Date(a.createdAt || a.date);
    const d2 = new Date(b.createdAt || b.date);

    return sortOrder === "newest" ? d2 - d1 : d1 - d2;
  });

  // ✅ Bulk Select (works on sortedRecords)
  const [selectedIds, setSelectedIds] = useState([]);
  const allSelected =
    sortedRecords.length > 0 && selectedIds.length === sortedRecords.length;

  // -------------------- FETCHING --------------------
  useEffect(() => {
    fetchMe();
    loadUsers();
  }, []);

  useEffect(() => {
    if (user) loadRecords(1);
  }, [user]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/api/users");
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    }
  };
  const loadRecords = async (page = 1) => {
    try {
      setRecLoading(true);
      const { data } = await api.get("/api/daily", {
        params: {
          page,
          pageSize: recPageSize,
          sortOrder, // ✅ Send sortOrder to backend
        },
      });

      setRecords(data.items || []);
      setRecPage(data.page);
      setRecTotal(data.total);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    loadRecords(1);
  }, [sortOrder]);

  // -------------------- INPUT ROWS --------------------
  const addRow = () => setRows([...rows, createRow()]);

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row._id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r._id !== id));
  };

  const uploadAll = async () => {
    try {
      setSaving(true);
      if (!rows.length) throw new Error("No rows added");

      for (const row of rows) {
        if (!row.userId) throw new Error("User is required");
        await api.post("/api/daily/save", {
          userId: row.userId,
          date,
          conversations: Number(row.conversations) || 0,
          avgFirstResponse: Number(row.avgFirst) || 0,
          avgResponseTime: Number(row.avgResp) || 0,
          unrepliedChats: Number(row.unreplied) || 0,
        });
      }

      toast.success("✅ Records uploaded");
      setRows([]);
      await loadRecords(1); // Refresh
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalPayout = useMemo(
    () =>
      rows.reduce(
        (sum, row) =>
          sum +
          calcSalary(
            row.conversations,
            row.avgFirst,
            row.avgResp,
            row.unreplied
          ).final,
        0
      ),
    [rows]
  );

  // -------------------- BULK & DELETE --------------------
  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? sortedRecords.map((r) => r._id) : []);
  };

  const toggleSelect = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return toast.error("Nothing selected");
    if (!confirm(`Delete ${selectedIds.length} record(s)?`)) return;

    try {
      await api.post("/api/daily/bulk-delete", { ids: selectedIds });
      toast.success("Deleted");
      loadRecords(recPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api.delete(`/api/daily/${id}`);
      toast.success("Deleted");
      loadRecords(recPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  // -------------------- EDIT --------------------
  const editRecord = async (id, form, done) => {
    try {
      await api.put(`/api/daily/${id}`, {
        conversations: Number(form.conversations) || 0,
        avgFirstResponse: Number(form.avgFirstResponse) || 0,
        avgResponseTime: Number(form.avgResponseTime) || 0,
        unrepliedChats: Number(form.unrepliedChats) || 0,
      });
      toast.success("Updated");
      done?.();
      loadRecords(recPage);
    } catch {
      toast.error("Update failed");
    }
  };

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Admin Upload</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Payout Compute Link */}
        <Link
          href="/dduhfhjdbnschdbbejfhiwdknsbciwuuddbsbcihefihjnnjwwebi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg"
        >
          💵 Compute Payout
        </Link>

        {/* Add Records Section */}
        <div className="bg-white border rounded-xl p-6 mt-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Add Records</h2>
            <button
              onClick={addRow}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              + Add Daily Record
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-center text-gray-500">
              No rows yet. Click <b>+ Add Row</b> to begin.
            </p>
          ) : (
            rows.map((row) => {
              const { combined, final } = calcSalary(
                row.conversations,
                row.avgFirst,
                row.avgResp,
                row.unreplied
              );
              return (
                <div
                  key={row._id}
                  className="bg-gray-50 border p-4 rounded-xl mb-3"
                >
                  <div className="grid md:grid-cols-6 gap-3">
                    <select
                      value={row.userId}
                      onChange={(e) =>
                        updateRow(row._id, "userId", e.target.value)
                      }
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="">-- User --</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.fullName} ({u.email})
                        </option>
                      ))}
                    </select>

                    {["conversations", "avgFirst", "avgResp", "unreplied"].map(
                      (field) => (
                        <input
                          key={field}
                          type="number"
                          value={row[field]}
                          onChange={(e) =>
                            updateRow(row._id, field, e.target.value)
                          }
                          className="border rounded-lg px-3 py-2"
                          placeholder={field}
                        />
                      )
                    )}

                    <div className="bg-white border rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Combined</p>
                      <b>{combined}m</b>
                      <p className="text-xs text-gray-500 mt-1">Final</p>
                      <b className="text-green-600">
                        ₦{final.toLocaleString()}
                      </b>
                    </div>
                  </div>

                  <div className="text-right mt-2">
                    <button
                      onClick={() => removeRow(row._id)}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {rows.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <p>
                Total:{" "}
                <b className="text-green-600">
                  ₦{totalPayout.toLocaleString()}
                </b>
              </p>
              <button
                onClick={uploadAll}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                {saving ? "Uploading..." : "Upload All"}
              </button>
            </div>
          )}
        </div>

        {/* ✅ Saved Records */}
        <div className="mt-10">
          <div className="flex justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Uploaded Records</h2>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {recLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : sortedRecords.length === 0 ? (
            <p className="text-center text-gray-500">No records yet.</p>
          ) : (
            sortedRecords.map((record) => (
              <RecordCard
                key={record._id}
                record={record}
                isSelected={selectedIds.includes(record._id)}
                onSelect={toggleSelect}
                onDelete={deleteRecord}
                onEdit={editRecord}
              />
            ))
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => loadRecords(Math.max(1, recPage - 1))}
              disabled={recPage <= 1}
              className="border px-4 py-2 rounded-md disabled:opacity-50"
            >
              ← Previous
            </button>
            <p className="text-sm">
              Page <b>{recPage}</b> of{" "}
              <b>{Math.ceil(recTotal / recPageSize)}</b>
            </p>
            <button
              onClick={() => loadRecords(recPage + 1)}
              disabled={!hasMore}
              className="border px-4 py-2 rounded-md disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
