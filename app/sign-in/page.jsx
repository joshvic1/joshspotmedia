"use client";
import { useAuth } from "@/lib/authStore";
import LoginModal from "@/components/LoginModal";
import { useEffect } from "react";

export default function SignInPage() {
  const { user, fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <LoginModal open={!user} />
    </div>
  );
}
