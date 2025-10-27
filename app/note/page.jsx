"use client";

import NoticeBar from "@/components/NoticeBar";
import React from "react";

export default function NotesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 my-6">Documentation</h1>

      {/* Terminologies */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2"> Key Terminologies</h2>
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Term</th>
              <th className="border px-4 py-2 text-left">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Dashboard</td>
              <td className="border px-4 py-2">
                Main user page showing all onboarded users daily earnings and
                updates.
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2">1st Time Response (Average) </td>
              <td className="border px-4 py-2">
                Time taken to reply to a customer for the first time. The time
                it took you to reply a new incoming message for the first time
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Avg Response</td>
              <td className="border px-4 py-2">
                Time taken to keep replying any message you've accepeted
                already.
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Conversation Closed</td>
              <td className="border px-4 py-2">
                The Total No. of conversations you've closed
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Combined</td>
              <td className="border px-4 py-2">
                The Average of your 1st response and your Avg response. We use
                this to determine your overall timing which if above 5 mins will
                affect your payout deduction.
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Unreplied</td>
              <td className="border px-4 py-2">
                The number of unreplied conversations at the end of your shift.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Salary & Payout */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Salary & Payout</h2>
        <p className="text-sm">
          Earnings are calculated daily between <b>10 PM - 7 AM</b>. Records
          appear automatically on the dashboard. Each record may include base
          earnings, bonuses, and deductions. Payouts are transferred weekly
          every SUNDAY.
        </p>
      </section>
      <br />
      {/* Salary & Payout */}
      <section>
        <h2 className="text-xl font-semibold mb-2">SHIFT</h2>
        <NoticeBar>
          <b>30/10 - (Monday)</b>
          <br />
          <br />
          deyikswe****@gmail.com
          <br />
          pit****@gmail.com
          <br /> cjhsj***@gmail.com
          <br />
          anty***@gmail.com <br />
          <br />
          <br />
          <b>31/10 - (Tuesday)</b>
          <br />
          <br />
          pit****@gmail.com
          <br />
          samchi****@gmail.com
          <br /> weyl****@gmail.com
          <br />
          swe****@gmail.com
          <br />
          <br />
          <b>1/11 - (Wednesday)</b>
          <br />
          <br />
          deyikswe****@gmail.com
          <br />
          pit****@gmail.com
          <br /> cjhsj***@gmail.com
          <br />
          anty***@gmail.com <br />
          <br />
          <br />
          <b>2/11 - (Thursday)</b>
          <br />
          <br />
          deyikswe****@gmail.com
          <br />
          pit****@gmail.com
          <br /> cjhsj***@gmail.com
          <br />
          anty***@gmail.com <br />
          <br />
          <br />
          <b>3/11 - (Friday)</b>
          <br />
          <br />
          deyikswe****@gmail.com
          <br />
          pit****@gmail.com
          <br /> cjhsj***@gmail.com
          <br />
          anty***@gmail.com <br />
          <br />
          <br />
          <b>4/11 - (Saturday)</b>
          <br />
          <br />
          deyikswe****@gmail.com
          <br />
          pit****@gmail.com
          <br /> cjhsj***@gmail.com
          <br />
          anty***@gmail.com <br />
          <br />
          <br />
          <b>5/11 - (Sunday)</b>
          <br />
          <br />
          deyikswe****@gmail.com
          <br />
          pit****@gmail.com
          <br /> cjhsj***@gmail.com
          <br />
          anty***@gmail.com <br />
          <br />
          <br />
        </NoticeBar>
      </section>
    </div>
  );
}
