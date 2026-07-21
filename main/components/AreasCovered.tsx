// components/AreasCovered.tsx
import type { AreasCovered as AreasCoveredType } from "@/lib/services";

export default function AreasCovered({ data }: { data: AreasCoveredType }) {
  if (!data) return null;

  return (
    <section id="areas" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1080px]">
        <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
          <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
          {data.title}
        </span>
        <h2 className="bsl-serif mb-5 max-w-2xl text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
          Covering most of London
        </h2>
        <p className="mb-9 max-w-2xl text-[1rem] leading-[1.8] text-[#5C544A]">
          {data.description}
        </p>

        <ul className="flex flex-wrap gap-2.5">
          {data.areas.map((area) => (
            <li
              key={area}
              className="bsl-mono rounded-full border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-2 text-[0.78rem] font-medium text-[#1C1712]"
            >
              {area}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}