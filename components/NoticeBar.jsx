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
  ttlMs = 1000, // 0 = persistent forever
  className = "",
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      // If ttlMs is 0, any stored dismissal means keep it closed
      if (!ttlMs) {
        setOpen(false);
        return;
      }
      // With ttl, only keep closed while not expired
      if (parsed?.expires && Date.now() < parsed.expires) {
        setOpen(false);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // ignore malformed storage
    }
  }, [storageKey, ttlMs]);

  const handleClose = () => {
    setOpen(false);
    if (!storageKey) return;
    try {
      const payload =
        ttlMs > 0
          ? { dismissed: true, expires: Date.now() + ttlMs }
          : { dismissed: true };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage failures
    }
  };

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "relative isolate rounded-xl border shadow-sm",
        "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100",
        "p-4 sm:p-5",
        className,
      ].join(" ")}
    >
      <div className="mx-auto flex items-start gap-3">
        <InformationCircleIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          {typeof children === "string" ? (
            <p className="leading-6">{children}</p>
          ) : (
            children
          )}
        </div>
        {/* <button
          onClick={handleClose}
          aria-label="Dismiss notice"
          className="ml-auto rounded-md p-1 hover:bg-blue-200/60"
        >
          <XMarkIcon className="h-5 w-5 text-blue-700" />
        </button> */}
      </div>

      {/* subtle inner ring for polish */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/50" />
    </div>
  );
}
