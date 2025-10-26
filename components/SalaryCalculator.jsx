"use client";
import { useMemo, useState } from "react";

function calculateSalary(conversations, avgFirst, avgResponse, unreplied) {
  const conv = Number(conversations) || 0;
  const first = Number(avgFirst) || 0;
  const resp = Number(avgResponse) || 0;
  const unr = Number(unreplied) || 0;

  const base = conv * 20; // ₦20 per conversation

  // Combined Avg = (First Response + Normal Response) / 2
  const combined = (first + resp) / 2;

  // Penalty logic:
  let penalty = 0;
  if (combined > 5) {
    const extra = combined - 5;
    const blocks = Math.ceil(extra / 5); // Every extra 5 mins → ₦2000 penalty
    penalty += blocks * 2000;
  }

  // Unreplied penalty:
  penalty += unr * 500;

  const final = Math.max(base - penalty, 0);

  return {
    base,
    combined: combined.toFixed(2),
    penalty,
    final,
  };
}

export default function SalaryCalculator() {
  const [conversations, setConversations] = useState(1000);
  const [avgFirst, setAvgFirst] = useState(5);
  const [avgResponse, setAvgResponse] = useState(5);
  const [unreplied, setUnreplied] = useState(0);

  const result = useMemo(
    () => calculateSalary(conversations, avgFirst, avgResponse, unreplied),
    [conversations, avgFirst, avgResponse, unreplied]
  );

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Live Salary Calculator</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <label>
          Conversations
          <input
            type="number"
            value={conversations}
            onChange={(e) => setConversations(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </label>
        <label>
          Avg First Response (mins)
          <input
            type="number"
            value={avgFirst}
            onChange={(e) => setAvgFirst(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </label>
        <label>
          Avg Response Time (mins)
          <input
            type="number"
            value={avgResponse}
            onChange={(e) => setAvgResponse(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </label>
        <label>
          Unreplied Chats
          <input
            type="number"
            value={unreplied}
            onChange={(e) => setUnreplied(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-600">Base Pay</p>
          <p className="font-semibold">₦{result.base.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-600">Combined Avg</p>
          <p className="font-semibold">{result.combined} mins</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-600">Penalty</p>
          <p className="font-semibold">₦{result.penalty.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-600">Final Salary</p>
          <p className="font-semibold">₦{result.final.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
