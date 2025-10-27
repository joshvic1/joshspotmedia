import "./globals.css";
import { Toaster } from "sonner";
import AppWrapper from "@/components/AppWrapper";
import TopLoader from "@/components/TopLoader"; // ✅ Import here

export const metadata = {
  title: "JOSHSPOTMEDIA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <TopLoader /> {/* ✅ Add this */}
        <AppWrapper>{children}</AppWrapper>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
