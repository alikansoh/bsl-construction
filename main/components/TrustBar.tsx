// components/TrustBar.tsx
import type { TrustBarItem } from "@/lib/services";
import { JSX } from "react/jsx-runtime";

const ICONS: Record<string, JSX.Element> = {
  team: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  service: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15l3-9 3 6 2-4 2 4 3-6 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  guarantee: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 10.3l1.8 1.8L15 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15.5L8 21l4-2 4 2-1-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  insured: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  recommended: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 11V20H5a1 1 0 01-1-1v-7a1 1 0 011-1h2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 11l3.2-6.4a1.6 1.6 0 013 .7V9h4.3a1.6 1.6 0 011.55 1.98l-1.4 6A1.6 1.6 0 0116.1 18H7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
};

export default function TrustBar({ items }: { items: TrustBarItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="relative bg-[#1C1712]">
      <div
        aria-hidden="true"
        className="bsl-grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
      />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-3 sm:px-8 lg:grid-cols-5 lg:gap-y-0 lg:px-10 lg:py-9">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`flex flex-col items-center gap-3 px-3 text-center ${
              i > 0 ? "sm:border-l sm:border-white/10" : ""
            }`}
          >
            <span className="text-[#E8C599]">{ICONS[item.id] ?? ICONS.guarantee}</span>
            <span className="bsl-mono text-[0.72rem] font-medium uppercase tracking-[0.06em] text-white/85">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}