"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import SalaryCalculator from "@/components/SalaryCalculator";
import { useAuth } from "@/lib/authStore";
import NoticeBar from "@/components/NoticeBar";

export default function CalculatorPage() {
  const { user, loading, fetchMe } = useAuth();

  // ✅ Fetch logged-in user only on first load
  useEffect(() => {
    if (!user) {
      fetchMe();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar is consistent across pages */}
      <Navbar />

      {/* ✅ Show login modal only when not authenticated */}
      <LoginModal open={!loading && !user} />

      {/* ✅ Only show calculator when user is logged in */}
      {user && (
        <main className="max-w-4xl mx-auto pt-24 px-4">
          <NoticeBar>
            <b>Note:</b> Use this calculator to estimate daily salary based on
            your perdormance for the day
          </NoticeBar>
          <h1 className="text-2xl font-semibold mb-4">Salary Calculator</h1>
          <SalaryCalculator />
        </main>
      )}
    </div>
  );
}
