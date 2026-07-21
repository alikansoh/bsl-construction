"use client";

/**
 * ServiceCard — BSL Construction
 * -------------------------------------------------------------------------
 * Shared card used on every /services/* category page. Image and copy live
 * in separate zones (image on top, solid panel below) so headline text is
 * never set directly on top of the photograph — only a small numbered
 * badge sits over the image itself.
 *
 * Mark the card with data-reveal so ScrollReveal (see components/ScrollReveal.tsx)
 * picks it up for the GSAP stagger-in animation automatically.
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface ServiceCardProps {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  image: { url: string; alt: string };
  index: number;
  accent?: string; // hex, defaults to brand brass
}

export default function ServiceCard({
  slug,
  title,
  shortDescription,
  category,
  image,
  index,
  accent = "#A26028",
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      data-reveal
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-[#1C1712]/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(28,23,18,0.28)] sm:rounded-[28px]"
    >
      {/* ---- Image zone ------------------------------------------------ */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#1C1712] sm:aspect-[16/11]">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle scrim so the badge stays legible on any photo, without
            hosting the headline itself */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1712]/35 via-transparent to-transparent" />

        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[#1C1712]/45 text-[0.7rem] font-semibold text-white backdrop-blur-md sm:right-5 sm:top-5 sm:h-10 sm:w-10">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* ---- Copy zone — solid panel, fully separate from the image ---- */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <span
          className="bsl-mono text-[0.62rem] uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {category}
        </span>

        <h3 className="mt-3 text-[1.5rem] font-medium leading-[1.1] tracking-[-0.03em] text-[#1C1712] sm:text-[1.75rem]">
          {title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6E6259] sm:text-[0.95rem] sm:leading-7">
          {shortDescription}
        </p>

        <div
          className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: accent }}
        >
          Explore Service
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}