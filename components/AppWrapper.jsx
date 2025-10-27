"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/authStore";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";

export default function AppWrapper({ children }) {
  const { user, loading, fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <>
      <Navbar />

      {/* Global login modal shown on all pages if not authenticated */}
      <LoginModal open={!loading && !user} />

      {/* Only show page content if logged in */}
      {user && children}
    </>
  );
}
