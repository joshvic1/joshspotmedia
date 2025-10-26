"use client";
import { useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function RecordCard({
  record,
  onDelete,
  onEdit,
  onSelect,
  isSelected,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    conversations: record.conversations,
    avgFirstResponse: record.avgFirstResponse,
    avgResponseTime: record.avgResponseTime,
    unrepliedChats: record.unrepliedChats,
  });

  const dateStr = new Date(record.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // ✅ Combined Response Time
  const combined =
    record.combinedAvgResponseTime !== undefined
      ? Number(record.combinedAvgResponseTime).toFixed(2)
      : (
          (Number(record.avgFirstResponse || 0) +
            Number(record.avgResponseTime || 0)) /
          2
        ).toFixed(2);

  // ✅ Base Salary & Penalty
  const base = Number(record.conversations) * 20;
  const extra = Math.max(Number(combined) - 5, 0);
  const penalty =
    Math.ceil(extra / 5) * 2000 + Number(record.unrepliedChats || 0) * 500;
  const finalSalary = Math.max(base - penalty, 0);

  const handleInput = (field, value) => setForm({ ...form, [field]: value });

  // ✅ Badge Logic
  const statusBadge =
    Number(combined) <= 5 ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
        ⚡ Fast
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
        ⏰ Slow
      </span>
    );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-[2px] transition duration-200 relative">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <p className="text-xs text-gray-500">{dateStr}</p>
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(record._id, e.target.checked)}
            className="w-4 h-4"
          />
        )}
      </div>

      {/* Name + Fast/Slow Badge */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm font-semibold text-gray-900">
          {record.user?.fullName || record.user?.email}
        </p>
        {statusBadge}
      </div>

      {!isEditing ? (
        <>
          {/* Metrics Section */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3 text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
              <span>Conversations closed:</span>
              <b>{record.conversations}</b>
            </div>

            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span>1st Resp:</span>
              <b
                className={
                  Number(record.avgFirstResponse) > 5
                    ? "text-red-500"
                    : "text-green-600"
                }
              >
                {record.avgFirstResponse}m
              </b>
            </div>

            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span>Avg Resp:</span>
              <b
                className={
                  Number(record.avgResponseTime) > 5
                    ? "text-red-500"
                    : "text-green-600"
                }
              >
                {record.avgResponseTime}m
              </b>
            </div>

            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-purple-500" />
              <span>Combined:</span>
              <b
                className={
                  Number(combined) > 5 ? "text-red-500" : "text-green-600"
                }
              >
                {combined}m
              </b>
            </div>

            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
              <span>Unreplied:</span>
              <b
                className={
                  record.unrepliedChats > 0 ? "text-red-500" : "text-gray-600"
                }
              >
                {record.unrepliedChats}
              </b>
            </div>
          </div>

          {/* Salary */}
          <p className="mt-4 text-lg font-bold text-green-600">
            ₦{finalSalary.toLocaleString()}
          </p>

          {/* Actions */}
          <div className="flex gap-4 mt-3 text-xs">
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(record._id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </>
      ) : (
        // ✅ Editing Mode
        <>
          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
            {[
              "conversations",
              "avgFirstResponse",
              "avgResponseTime",
              "unrepliedChats",
            ].map((field, idx) => (
              <input
                key={idx}
                type="number"
                value={form[field]}
                onChange={(e) => handleInput(field, e.target.value)}
                placeholder={field}
                className="border rounded-lg px-3 py-2"
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Combined: <b>{combined}m</b>
          </p>

          <div className="flex gap-4 mt-3 text-xs">
            <button
              onClick={() =>
                onEdit(record._id, form, () => setIsEditing(false))
              }
              className="text-green-600 hover:underline"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
