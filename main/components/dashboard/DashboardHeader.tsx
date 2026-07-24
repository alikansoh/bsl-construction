"use client";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-black/[0.07] bg-[#f5f4f1]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-black/[0.03] lg:hidden"
        aria-label="Open menu"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>

      {/* Desktop title */}
      <div className="hidden lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A26028]">
          BSL Construction
        </p>

        <p className="mt-1 text-sm font-medium text-black/50">
          Management Portal
        </p>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification */}
        <button
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-black/[0.03]"
          aria-label="Notifications"
        >
          <svg
            className="h-5 w-5 text-black/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#A26028]" />
        </button>

        {/* User */}
        <div className="hidden items-center gap-3 border-l border-black/10 pl-4 sm:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b0b0d] text-xs font-semibold text-white">
            A
          </div>

          <div>
            <p className="text-sm font-semibold">
              Admin
            </p>

            <p className="text-xs text-black/40">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}