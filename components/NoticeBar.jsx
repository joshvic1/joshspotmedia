"use client";

import { useEffect, useState } from "react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * NoticeBar
 * Props:
 * - children: ReactNode | string (your custom message/content)
 * - storageKey?: string (if set, dismissal will persist in localStorage)
 * - ttlMs?: number (how long to keep it dismissed; 0 = forever until key changes)
 * - className?: string (optional extra classes)
 */
export default function NoticeBar({
  children,
  storageKey = "dashboard-notice",
  ttlMs = 1000,
  className = "",
  variant = "info", // ✅ new prop for styling
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!ttlMs) return setOpen(false);

      if (parsed?.expires && Date.now() < parsed.expires) {
        setOpen(false);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {}
  }, [storageKey, ttlMs]);

  const handleClose = () => {
    setOpen(false);
    if (!storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(
        ttlMs > 0
          ? { dismissed: true, expires: Date.now() + ttlMs }
          : { dismissed: true }
      )
    );
  };

  if (!open) return null;

  // ✅ Variant styles
  const VARIANT_STYLES = {
    info: {
      background: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-900",
    },
    danger: {
      background: "from-red-50 to-red-100",
      border: "border-red-200",
      icon: "text-red-600",
      text: "text-red-900",
    },
  };

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "relative isolate rounded-xl border shadow-sm p-4 sm:p-5",
        styles.border,
        `bg-gradient-to-r ${styles.background}`,
        className,
      ].join(" ")}
    >
      <div className="mx-auto flex items-start gap-3">
        <InformationCircleIcon
          className={`h-5 w-5 flex-shrink-0 ${styles.icon}`}
        />
        <div className={`text-sm ${styles.text}`}>{children}</div>

        <button
          onClick={handleClose}
          aria-label="Dismiss notice"
          className="ml-auto rounded-md p-1 hover:bg-black/10"
        >
          <XMarkIcon className={`h-5 w-5 ${styles.icon}`} />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/50" />
    </div>
  );
}
