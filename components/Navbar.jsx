"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authStore";
import { toast } from "sonner";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out");
    setMenuOpen(false); // ✅ Close menu after logout
  };

  // ✅ Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gray-900" />
          <span className="text-[15px] font-semibold">JOSHSPOTMEDIA</span>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <div className="hidden md:flex items-center gap-5">
            <NavLinks pathname={pathname} />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        {user && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            <NavLinks pathname={pathname} onClick={() => setMenuOpen(false)} />

            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLinks({ pathname, onClick }) {
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/calculator", label: "Calculator" },
    { href: "/records", label: "Records" },
    // { href: "/summary", label: "Summary" },
    { href: "/salary", label: "Payout" },
    { href: "/note", label: "Documentation" },
  ];

  return links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={onClick}
      className={`block text-sm ${
        pathname === link.href
          ? "text-gray-900 font-semibold"
          : "text-gray-700 hover:text-gray-900"
      }`}
    >
      {link.label}
    </Link>
  ));
}
