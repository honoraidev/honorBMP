"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export type SidebarItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
  group: string;
};

type IconName =
  | "home"
  | "form"
  | "primary"
  | "secondary"
  | "board"
  | "cycle"
  | "approve";

const ICONS: Record<IconName, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  form: (
    <>
      <path d="M8 3h6l5 5v13H5V3z" />
      <path d="M14 3v5h5M8.5 13h7M8.5 16.5h7" />
    </>
  ),
  primary: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  secondary: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 15v-3M12 15V9M16 15v-5" />
    </>
  ),
  cycle: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </>
  ),
  approve: (
    <>
      <path d="M4 20h16" />
      <path d="M14.5 4.5a2.1 2.1 0 0 1 3 3L9 16l-4 1 1-4 8.5-8.5z" />
    </>
  ),
};

const STORAGE_KEY = "cs-sidebar-collapsed";

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = search.toString() ? `${pathname}?${search.toString()}` : pathname;

  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const groups = items.reduce<Record<string, SidebarItem[]>>((acc, it) => {
    (acc[it.group] ||= []).push(it);
    return acc;
  }, {});

  return (
    <aside
      className={`hidden lg:flex shrink-0 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden border-r border-black/5 bg-white transition-[width] duration-200 ease-in-out ${
      collapsed ? "w-[4.5rem]" : "w-64"
    } ${ready ? "" : "invisible"}`}
    >
      <div
        className={`flex items-center gap-2 px-3 h-11 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
            功能選單
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "展開側邊欄" : "收合側邊欄"}
          title={collapsed ? "展開側邊欄" : "收合側邊欄"}
          className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-teal/10 hover:text-teal transition"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 pt-1 pb-4 space-y-5">
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            {!collapsed ? (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {group}
              </p>
            ) : (
              <div className="mx-3 mb-2 border-t border-black/5" />
            )}
            <div className="space-y-1">
              {groupItems.map((it) => {
                const active =
                  it.href === current ||
                  (it.href !== "/" && current.startsWith(it.href));
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    title={collapsed ? it.label : undefined}
                    className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
                      collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                    } ${
                      active
                        ? "bg-gradient-to-r from-teal/15 to-teal/5 text-teal font-semibold shadow-sm"
                        : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-teal transition-all ${
                        active ? "w-1 opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                    <span className="relative grid place-items-center">
                      <Icon
                        name={it.icon}
                        className={`h-[1.15rem] w-[1.15rem] shrink-0 transition-transform group-hover:scale-110 ${
                          active ? "text-teal" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      {collapsed && typeof it.badge === "number" && it.badge > 0 && (
                        <span className="absolute -right-2.5 -top-2 inline-flex min-w-[1rem] justify-center rounded-full bg-teal px-1 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                          {it.badge}
                        </span>
                      )}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{it.label}</span>
                        {typeof it.badge === "number" && it.badge > 0 && (
                          <span
                            className={`inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                              active ? "bg-teal text-white" : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {it.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

    </aside>
  );
}