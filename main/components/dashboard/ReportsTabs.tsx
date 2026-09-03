"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ReportsTabs() {
  const pathname = usePathname() ?? "";
  const onQuotes = pathname.startsWith("/dashboard/reports/quotes");

  const tabs = [
    { href: "/dashboard/reports", label: "Invoices", active: !onQuotes },
    { href: "/dashboard/reports/quotes", label: "Quotes", active: onQuotes },
  ];

  return (
    <div className="mb-5 inline-flex rounded-xl border border-black/[0.08] bg-white p-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
            t.active ? "bg-[#a07b42] text-white" : "text-gray-500 hover:text-[#111214]"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
