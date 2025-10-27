// app/layout.js
import "./globals.css";
import { Toaster } from "sonner";
import AppWrapper from "@/components/AppWrapper";
import { useAuth } from "@/lib/authStore";

export const metadata = {
  title: "JOSHSPOTMEDIA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <useAuth>
          <AppWrapper>{children}</AppWrapper>
          <Toaster position="top-right" richColors closeButton />
        </useAuth>
      </body>
    </html>
  );
}
