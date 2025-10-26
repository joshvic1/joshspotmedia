"use client";
import { useState, useMemo } from "react";
import NoticeBar from "@/components/NoticeBar";

function computeSalary({ conversations, avgFirst, avgResp, unreplied }) {
  const conv = Number(conversations) || 0;
  const first = Number(avgFirst) || 0;
  const resp = Number(avgResp) || 0;
  const unr = Number(unreplied) || 0;

  // ✅ Base salary
  const base = conv * 20;

  // ✅ Combined average response time
  const combined = (first + resp) / 2;

  // ✅ Penalty (calculated only from combined avg time)
  let penalty = 0;
  if (combined > 5) {
    const extraTime = combined - 5;
    const blocks = Math.ceil(extraTime / 5);
    penalty += blocks * 2000;
  }

  // ✅ Penalty for unreplied chats
  penalty += unr * 500;

  // ✅ Final salary
  const final = Math.max(base - penalty, 0);

  return {
    base,
    combined: Number(combined.toFixed(2)),
    penalty,
    final,
  };
}

export default function SalaryCalculator() {
  const [conversations, setConversations] = useState(1000);
  const [avgFirst, setAvgFirst] = useState(5);
  const [avgResp, setAvgResp] = useState(5);
  const [unreplied, setUnreplied] = useState(0);

  const r = useMemo(
    () => computeSalary({ conversations, avgFirst, avgResp, unreplied }),
    [conversations, avgFirst, avgResp, unreplied]
  );

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <NoticeBar>
        <b>Note:</b> Use this calculator to estimate daily salary based on your
        perdormance for the day
      </NoticeBar>
      <h3 className="mb-4 text-lg font-semibold">Live Salary Calculator</h3>
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm">
          Conversations
          <input
            type="number"
            value={conversations}
            onChange={(e) => setConversations(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Avg First Response (mins)
          <input
            type="number"
            value={avgFirst}
            onChange={(e) => setAvgFirst(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Avg Response Time (mins)
          <input
            type="number"
            value={avgResp}
            onChange={(e) => setAvgResp(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Unreplied Chats
          <input
            type="number"
            value={unreplied}
            onChange={(e) => setUnreplied(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-gray-500">Base</div>
          <div className="text-lg font-semibold">
            ₦{r.base.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-gray-500">Combined Avg</div>
          <div className="text-lg font-semibold">{r.combined} mins</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-gray-500">Penalty</div>
          <div className="text-lg font-semibold">
            ₦{r.penalty.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-gray-500">Final</div>
          <div className="text-lg font-semibold">
            ₦{r.final.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
