// frontend/app/layout.js
import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "JOSHSPOTMEDIA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
