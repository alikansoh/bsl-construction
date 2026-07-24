"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <rect x="5" y="5" width="14" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 7h18" />
        <path d="M5 7v13h14V7" />
        <path d="M8 7V4h8v3" />
      </svg>
    ),
  },
  {
    label: "Blog",
    href: "/dashboard/blog",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
      </svg>
    ),
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
];

const MANAGEMENT_ITEMS = [
  {
    label: "Users",
    href: "/dashboard/users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 003.6 15a1.65 1.65 0 00-1.51-1H2a2 2 0 010-4h.09A1.65 1.65 0 003.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 008 4.6h.09A1.65 1.65 0 009 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9v.09A1.65 1.65 0 0020.91 10H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function DashboardSidebar({
  open,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 flex h-screen w-[280px]
        flex-col border-r border-[#D9D5CC]
        bg-[#F3F1EC] text-[#171717]
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Logo */}
      <div className="flex h-[88px] items-center justify-between border-b border-[#D9D5CC] px-7">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="BSL Construction"
            width={170}
            height={85}
            priority
            className="h-auto w-[170px]"
          />
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6861] transition hover:bg-white hover:text-[#171717] lg:hidden"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-7">
        {/* Workspace */}
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A968E]">
          Workspace
        </p>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 rounded-xl px-3 py-3
                  text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-[#171717] text-white shadow-sm"
                      : "text-[#625F58] hover:bg-white hover:text-[#171717]"
                  }
                `}
              >
                <span
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-lg
                    transition
                    ${
                      active
                        ? "bg-white/10"
                        : "bg-white/60 group-hover:bg-[#F3F1EC]"
                    }
                  `}
                >
                  <span className="h-[18px] w-[18px]">
                    {item.icon}
                  </span>
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-7 h-px bg-[#D9D5CC]" />

        {/* Management */}
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A968E]">
          Management
        </p>

        <nav className="space-y-1">
          {MANAGEMENT_ITEMS.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 rounded-xl px-3 py-3
                  text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-[#171717] text-white shadow-sm"
                      : "text-[#625F58] hover:bg-white hover:text-[#171717]"
                  }
                `}
              >
                <span
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-lg
                    ${
                      active
                        ? "bg-white/10"
                        : "bg-white/60 group-hover:bg-[#F3F1EC]"
                    }
                  `}
                >
                  <span className="h-[18px] w-[18px]">
                    {item.icon}
                  </span>
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="border-t border-[#D9D5CC] p-4">
        <div className="flex items-center gap-3 rounded-xl border border-[#D9D5CC] bg-white/70 p-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#171717] text-sm font-semibold text-white">
            A
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#171717]">
              Admin User
            </p>

            <p className="truncate text-xs text-[#8A867E]">
              Administrator
            </p>
          </div>

          {/* Logout */}
          <Link
            href="/api/logout"
            title="Logout"
            aria-label="Logout"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8A867E] transition hover:bg-red-50 hover:text-red-500"
          >
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 19V5a2 2 0 00-2-2h-6" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}