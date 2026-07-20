import type { ReactNode } from "react";

type Capability = {
  icon: ReactNode;
  title: string;
  copy: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: "Full Fit-Out, Fully Coordinated",
    copy: "We handle first-fix plumbing and electrics, tiling, cabinetry installation, and worktops — sequenced so trades never collide on site.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 12h16M4 6h16M4 18h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Layouts Built Around Real Life",
    copy: "Worktop runs, storage, and sightlines are worked out before anything is fitted — planned around how the room is actually used, not just how it photographs.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function ServiceCapabilities() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {CAPABILITIES.map((cap) => (
        <div
          key={cap.title}
          className="group relative overflow-hidden rounded-[1.5rem] border border-[#1C1712]/8 bg-[#FBF9F6] p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#A26028]/40 hover:shadow-[0_24px_48px_-20px_rgba(28,23,18,0.2)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#A26028] via-[#E8C599] to-[#A26028] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#A26028]/40 bg-white text-[#A26028] transition-colors duration-300 ease-out group-hover:border-[#A26028] group-hover:bg-[#A26028] group-hover:text-white">
            {cap.icon}
          </span>
          <h3 className="bsl-serif mb-3 text-[1.1rem] font-semibold leading-snug text-[#1C1712]">
            {cap.title}
          </h3>
          <p className="text-[0.98rem] leading-[1.7] text-[#4A443C]">{cap.copy}</p>
        </div>
      ))}
    </div>
  );
}