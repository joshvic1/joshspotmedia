"use client";
import { useAuth } from "@/lib/authStore";
import LoginModal from "@/components/LoginModal";
import { useEffect } from "react";

export default function SignInPage() {
  const { user, fetchMe } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user && !loading) {
        setShowModal(true);
      }
    }, 3000); // Show modal after 3 sec even if server is slow

    fetchMe().finally(() => clearTimeout(timeout));
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <LoginModal open={!user} />
    </div>
  );
}
