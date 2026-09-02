"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Reminder } from "@/lib/reminder-types";
import { reminderCountLabel } from "@/lib/reminder-types";

const DOT: Record<Reminder["level"], string> = {
  overdue: "bg-red-500",
  due_soon: "bg-amber-500",
  upcoming: "bg-teal",
};

export default function NotificationBell({ reminders }: { reminders: Reminder[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const urgent = reminders.filter((r) => r.level !== "upcoming").length;
  const count = reminders.length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="通知"
        className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 text-white hover:bg-white/20 transition"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 && (
          <span
            className={`absolute -right-1 -top-1 inline-flex min-w-[1.1rem] justify-center rounded-full px-1 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-[#06a09a] ${
              urgent > 0 ? "bg-red-500" : "bg-white/30"
            }`}
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl bg-white text-gray-700 shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-navy">考核提醒</span>
            <span className="text-xs text-gray-400">{count} 項</span>
          </div>
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">目前沒有待辦事項</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {reminders.map((r) => (
                <li key={r.id}>
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[r.level]}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{r.title}</span>
                      <span className="block text-xs text-gray-500 leading-relaxed">{r.detail}</span>
                      <span
                        className={`block text-xs mt-0.5 ${
                          r.level === "overdue"
                            ? "text-red-600"
                            : r.level === "due_soon"
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        截止 {r.dueDate}・{reminderCountLabel(r.daysLeft)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
