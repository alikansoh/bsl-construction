"use client";

/**
 * Services.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * The section directly after Hero. Shows four flagship service
 * categories as premium, editorial-style cards, then a lighter
 * "Maintenance & Trades" tile grid for the remaining nine trades, then
 * hands off to a full listing page ("Discover all services") if needed.
 *
 * Category grouping (not part of the original data, chosen as a
 * reasonable default — swap freely):
 *   New Builds            → /services/new-builds
 *   Extensions             → /services/extensions
 *   Full Refurbishments    → /services/full-refurbishments
 *   Kitchens & Bathrooms   → /services/kitchens-bathrooms (merges the
 *                             separate Kitchen / Bathroom menu items)
 *
 * The remaining trades (Painting and Decorating, Electricals,
 * Brickworks, Doors, Flooring, Concreting, Windows, Carpentry,
 * Plumbing) are shown below the featured cards as a lighter tile grid —
 * no heavyweight imagery or hover choreography, just clean linked tiles.
 * Each service, including these, is assumed to have its own page at
 * /services/[slug].
 *
 * Design language (premium pass):
 * - Light theme, white ground and white cards, hairline borders and a
 *   layered, warm-toned shadow rather than a background color shift.
 * - Cards run 1 / 2 / 4 per row (mobile / tablet / wide desktop) instead
 *   of maxing out at 2 columns, so on larger screens each card stays
 *   compact rather than ballooning to fill the row.
 * - Tall, editorial (4:5) project imagery — reads like a portfolio of
 *   finished work rather than a blog-style thumbnail grid. A permanent,
 *   quiet base gradient keeps the kicker/title legible; hover deepens it.
 * - The old "DWG 01–04" numbering is gone; each card carries a short,
 *   true kicker ("Ground-Up", "Add & Adapt"...) that actually describes
 *   the scope of that service, so the label encodes information instead
 *   of decorating with a fake sequence. A short gold hairline under each
 *   kicker gives it the weight of a section label rather than a tag.
 * - A thin blueprint-ruler tick line under the section intro is the one
 *   nod to the brand's drafting/construction roots — quiet, structural,
 *   not literal.
 * - The intro line ("From first foundation...") is split per letter and
 *   given a slow, continuous wave/writhe — a small ambient signature
 *   that sits above the cards, distinct from their hover choreography.
 *   Skipped entirely under prefers-reduced-motion.
 * - Signature card interaction: hovering (or focusing) a card plays one
 *   GSAP timeline — the card lifts, the image settles and darkens under
 *   a scrim, a "Discover more" badge scales in, the corner-registration
 *   brackets draw on in a warm gold, the card's border warms from
 *   hairline charcoal to gold, and the arrow nudges — instead of several
 *   independent CSS transitions firing separately.
 * - Scroll-driven GSAP: each card wipes into view once (clip-path
 *   curtain reveal, not a plain fade) via its own ScrollTrigger, and the
 *   image drifts gently (parallax) as the card passes through the
 *   viewport.
 * - Pointer tilt: on fine-pointer devices, the card leans subtly toward
 *   the cursor for a tactile, premium feel. Skipped on touch devices and
 *   under prefers-reduced-motion.
 * - Section break: the seam between the flagship cards and the trades
 *   grid below is marked by a printer's/drafting registration mark (a
 *   circle + crosshair) flanked by two hairlines that draw in from the
 *   center outward on scroll — a direct callback to the corner-
 *   registration brackets on the cards above, so the "structural" motif
 *   is reused deliberately rather than introducing a new decoration.
 * - Maintenance & Trades: sits inside a softly tinted panel (a shade
 *   warmer than the page's white) so it reads as a distinct, calmer
 *   tier — a supporting spec sheet rather than a second row of
 *   portfolio work — while the white tiles inside it keep their own
 *   hairline border + subtle hover lift, matching the brand palette
 *   without competing for attention against the flagship cards above.
 * - 3D massing model: a small three.js scene sits next to the section
 *   intro (stacked below it on mobile) — and it now plays out as a
 *   literal renovation, not just a shape settling into place. A house
 *   rises on its foundation in a rough, "under construction" grey;
 *   scaffolding goes up around it while the walls are still raw; a
 *   single-storey extension grows out from the side (a nod to "Add &
 *   Adapt"); the roof settles on and the whole model's line-work warms
 *   from grey to the brand gold as the build is "finished"; window
 *   frames fade in as the last fit-out touch; then the scaffolding
 *   comes back down to reveal the finished home. It idles afterward in
 *   a slow ambient rotation with a light pointer-tilt, the same
 *   restrained interaction language as the cards' own tilt. It is
 *   decorative (aria-hidden) and intentionally not a drag-to-orbit toy.
 *
 * Styling: Tailwind utility classes for layout/color/type; GSAP for
 * anything scroll-linked, continuous, or orchestrated. Uses next/image
 * (fill layout, so each media wrapper stays `relative` with a defined
 * aspect ratio).
 * Expects files at:
 *   /public/services/new-builds.jpg
 *   /public/services/extensions.jpg
 *   /public/services/full-refurbishments.jpg
 *   /public/services/kitchens-bathrooms.jpg
 *
 * Requires the `gsap` and `three` packages: npm install gsap three
 * -------------------------------------------------------------------------
 */

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FeaturedService = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

type MaintenanceService = {
  id: string;
  title: string;
  href: string;
};

const FEATURED_SERVICES: FeaturedService[] = [
  {
    id: "new-builds",
    kicker: "Ground-Up",
    title: "New Builds",
    description:
      "Ground-up homes engineered for the site they stand on, not just the plan they started as.",
    image: "/building.jpg",
    href: "/services/new-builds",
  },
  {
    id: "extensions",
    kicker: "Add & Adapt",
    title: "Extensions",
    description:
      "More space without losing the character of the original house.",
    image: "/extension.jpg",
    href: "/services/extensions",
  },
  {
    id: "full-refurbishments",
    kicker: "Whole-Home",
    title: "Full Refurbishments",
    description:
      "Whole-home renovations, coordinated from first fix through to the final coat.",
    image: "/rennovation.jpg",
    href: "/services/full-refurbishments",
  },
  {
    id: "kitchens-bathrooms",
    kicker: "Fit & Finish",
    title: "Kitchens & Bathrooms",
    description:
      "The two rooms that get used the most, fitted properly and built to last.",
    image: "/kitchen.jpg",
    href: "/services/kitchens-bathrooms",
  },
];

const MAINTENANCE_SERVICES: MaintenanceService[] = [
  {
    id: "painting-decorating",
    title: "Painting and Decorating",
    href: "/services/painting-decorating",
  },
  { id: "electricals", title: "Electricals", href: "/services/electricals" },
  { id: "brickworks", title: "Brickworks", href: "/services/brickworks" },
  { id: "doors", title: "Doors", href: "/services/doors" },
  { id: "flooring", title: "Flooring", href: "/services/flooring" },
  { id: "concreting", title: "Concreting", href: "/services/concreting" },
  { id: "windows", title: "Windows", href: "/services/windows" },
  { id: "carpentry", title: "Carpentry", href: "/services/carpentry" },
  { id: "plumbing", title: "Plumbing", href: "/services/plumbing" },
];

const SUBTITLE = "From first foundation to final fit-out — here's where most projects start.";

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimelines = useRef<(gsap.core.Timeline | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const modelContainerRef = useRef<HTMLDivElement>(null);

  // ---- Card scroll-reveal, parallax, hover choreography, pointer tilt.
  useEffect(() => {
    const cards = cardRefs.current.filter(
      (el): el is HTMLAnchorElement => el !== null
    );
    if (cards.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const scrollTriggers: ScrollTrigger[] = [];
    const parallaxTriggers: ScrollTrigger[] = [];
    const moveCleanups: (() => void)[] = [];

    cards.forEach((card, i) => {
      const q = gsap.utils.selector(card);
      const image = q("[data-card-image]");
      const corners = q("[data-card-corner]");
      const arrow = q("[data-card-arrow]");
      const scrim = q("[data-card-scrim]");
      const badge = q("[data-card-badge]");
      const border = q("[data-card-border]");

      // ---- Entrance: a curtain-wipe reveal instead of a plain fade.
      gsap.set(card, {
        opacity: reduceMotion ? 1 : 0,
        y: reduceMotion ? 0 : 24,
        transformPerspective: 800,
      });
      gsap.set(image, {
        clipPath: reduceMotion ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
        scale: reduceMotion ? 1.03 : 1.12,
      });
      gsap.set(corners, { opacity: 0 });
      gsap.set(badge, { opacity: 0, scale: 0.7, y: 10 });
      gsap.set(scrim, { opacity: 0 });

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: () => {
            const delay = reduceMotion ? 0 : (i % 4) * 0.1;
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0.01 : 0.75,
              ease: "power3.out",
              delay,
            });
            gsap.to(image, {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1.03,
              duration: reduceMotion ? 0.01 : 1.05,
              ease: "power3.out",
              delay,
            });
          },
        })
      );

      // ---- Parallax: image drifts gently as the card scrolls through
      // the viewport, for a bit of depth. Skipped under reduced motion.
      if (!reduceMotion) {
        parallaxTriggers.push(
          ScrollTrigger.create({
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            onUpdate: (self) => {
              gsap.set(image, { y: (self.progress - 0.5) * 28 });
            },
          })
        );
      }

      // ---- Hover / focus: one orchestrated moment — lift, image settle,
      // scrim, badge, corner draw, border warm, arrow nudge — instead of
      // several independent CSS transitions.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.to(
        card,
        {
          y: reduceMotion ? 0 : -6,
          scale: reduceMotion ? 1 : 1.014,
          duration: reduceMotion ? 0.01 : 0.5,
        },
        0
      )
        .to(image, { scale: reduceMotion ? 1.03 : 1.14, duration: reduceMotion ? 0.01 : 0.9 }, 0)
        .to(scrim, { opacity: reduceMotion ? 0 : 0.4, duration: reduceMotion ? 0.01 : 0.45 }, 0)
        .to(border, { opacity: 1, duration: reduceMotion ? 0.01 : 0.4 }, 0)
        .to(badge, { opacity: 1, scale: 1, y: 0, duration: reduceMotion ? 0.01 : 0.4 }, 0.05)
        .to(
          corners,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: reduceMotion ? 0.01 : 0.45,
            stagger: reduceMotion ? 0 : 0.05,
          },
          0.05
        )
        .to(arrow, { x: reduceMotion ? 0 : 3, duration: reduceMotion ? 0.01 : 0.25 }, 0.1);
      hoverTimelines.current[i] = tl;

      // ---- Pointer tilt: a subtle 3D lean toward the cursor. Fine
      // pointers only, and skipped under reduced motion.
      if (canHover && !reduceMotion) {
        const rotateX = gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3.out" });

        const handleMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          rotateY(px * 5);
          rotateX(py * -5);
        };
        const handleLeave = () => {
          rotateX(0);
          rotateY(0);
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);
        moveCleanups.push(() => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        });
      }
    });

    return () => {
      scrollTriggers.forEach((t) => t.kill());
      parallaxTriggers.forEach((t) => t.kill());
      hoverTimelines.current.forEach((tl) => tl?.kill());
      hoverTimelines.current = [];
      moveCleanups.forEach((fn) => fn());
    };
  }, []);

  // ---- Subtitle: a slow, continuous per-letter wave — an ambient
  // signature distinct from the cards' own (hover-triggered) motion.
  useEffect(() => {
    const subtitle = subtitleRef.current;
    if (!subtitle) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const letters = subtitle.querySelectorAll("[data-letter]");
    if (letters.length === 0) return;

    const tween = gsap.to(letters, {
      y: -4,
      rotate: 3,
      duration: 1.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.032,
        yoyo: true,
        repeat: -1,
      },
    });

    return () => {
      tween.kill();
      gsap.set(letters, { clearProps: "transform" });
    };
  }, []);

  // ---- Section-break divider: the two hairlines draw in from the
  // center outward and the registration mark (ring + crosshair) settles
  // in behind them, once, as the seam scrolls into view. A quiet callback
  // to the cards' own corner-registration brackets above.
  useEffect(() => {
    const divider = dividerRef.current;
    if (!divider) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const q = gsap.utils.selector(divider);
    const lines = q("[data-divider-line]");
    const ring = q("[data-divider-ring]");
    const cross = q("[data-divider-cross]");

    if (reduceMotion) {
      gsap.set(lines, { scaleX: 1 });
      gsap.set(ring, { opacity: 1, strokeDashoffset: 0 });
      gsap.set(cross, { opacity: 1 });
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: divider,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(lines, { scaleX: 1, duration: 0.9, ease: "power3.out" });
        gsap.to(ring, {
          opacity: 1,
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.15,
        });
        gsap.to(cross, { opacity: 1, duration: 0.35, delay: 0.5 });
      },
    });

    return () => trigger.kill();
  }, []);

  // ---- 3D massing model: a literal renovation-in-progress diorama.
  // A house rises on its foundation still in a rough, "under
  // construction" grey; scaffolding goes up around it; a single-storey
  // extension grows out from the wall face (a nod to "Add & Adapt");
  // the roof settles on and the whole structure's line-work warms from
  // grey to the brand gold as the build is "finished"; window frames
  // fade in as the last fit-out touch; then the scaffolding comes back
  // down to reveal the finished home. A literal read of "From first
  // foundation to final fit-out," not just a shape fading into view.
  // Idles afterward in a slow ambient rotation with a light pointer
  // tilt — the same restrained interaction language as the cards' own
  // tilt — not a full drag-to-orbit viewer. Decorative (aria-hidden).
  useEffect(() => {
    const container = modelContainerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    let width = container.clientWidth || 380;
    let height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(4.2, 3.1, 5.6);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(3, 5, 4);
    scene.add(ambient, key);

    const group = new THREE.Group();
    group.rotation.y = -0.5;
    scene.add(group);

    const ROUGH = 0x9a948c; // raw, "under construction" grey
    const GOLD = 0xa26028; // brand gold — reads as "finished"
    const GOLD_RGB = { r: 162 / 255, g: 96 / 255, b: 40 / 255 };
    const FILL = 0x1c1712;

    // A structural piece: near-invisible fill + edge wireframe whose
    // edge color can be tweened independently — grey while the piece is
    // still "under construction", gold once the build is "finished".
    const makePiece = (geometry: THREE.BufferGeometry, edgeColor = ROUGH) => {
      const fill = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: FILL,
          transparent: true,
          opacity: 0.045,
          roughness: 1,
        })
      );
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 20),
        new THREE.LineBasicMaterial({
          color: edgeColor,
          transparent: true,
          opacity: 0.85,
        })
      );
      const piece = new THREE.Group();
      piece.add(fill, edges);
      return piece;
    };
    const fillOf = (p: THREE.Object3D) => p.children[0] as THREE.Mesh;
    const edgesOf = (p: THREE.Object3D) => p.children[1] as THREE.LineSegments;

    // Foundation slab.
    const foundation = makePiece(new THREE.BoxGeometry(3.2, 0.4, 2.2));
    foundation.position.set(0, -1.2, 0);

    // Main wall block.
    const walls = makePiece(new THREE.BoxGeometry(2.8, 1.6, 1.8));
    walls.position.set(0, -0.2, 0);

    // Gabled roof over the main block.
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-1.5, 0);
    roofShape.lineTo(0, 1.05);
    roofShape.lineTo(1.5, 0);
    roofShape.lineTo(-1.5, 0);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      depth: 1.9,
      bevelEnabled: false,
    });
    roofGeo.translate(0, 0, -0.95);
    const roof = makePiece(roofGeo);
    roof.position.set(0, 0.6, 0);

    // Single-storey extension — grows outward from the wall's east
    // face, up from ground level. A literal "Add & Adapt" moment: the
    // geometry is translated so it pivots at its own base-inner corner,
    // so scaling it from 0 grows a new room out of the house rather
    // than inflating a box from the house's center.
    const extW = 1.05;
    const extH = 1.0;
    const extD = 1.4;
    const extGeo = new THREE.BoxGeometry(extW, extH, extD);
    extGeo.translate(extW / 2, extH / 2, 0);
    const extension = makePiece(extGeo);
    extension.position.set(1.4, -1.0, 0); // anchored at the wall face, on the foundation
    extension.scale.set(0.001, 0.001, 0.001);

    group.add(foundation, walls, roof, extension);

    // Window frames — thin gold outlines that fade in late, as the
    // "final fit-out" pass.
    const makeWindow = (w: number, h: number) => {
      const geo = new THREE.BoxGeometry(w, h, 0.02);
      return new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 1),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0 })
      );
    };
    const windowA = makeWindow(0.42, 0.5);
    windowA.position.set(-0.55, -0.1, 0.91);
    const windowB = makeWindow(0.42, 0.5);
    windowB.position.set(0.55, -0.1, 0.91);
    const windowC = makeWindow(0.34, 0.4);
    windowC.position.set(1.925, -0.5, 0.71);
    group.add(windowA, windowB, windowC);

    // Scaffold — a light wireframe cage that goes up around the house
    // while it's "under construction" and comes back down once the
    // build is finished. Built as a single LineSegments so its fade
    // in/out is one uniform opacity tween rather than many objects.
    const scaffoldPts: number[] = [];
    const addSeg = (a: [number, number, number], b: [number, number, number]) => {
      scaffoldPts.push(...a, ...b);
    };
    const sx = 1.62;
    const sz = 1.06;
    const sBase = -1.0;
    const sTop = 1.75;
    const corners: [number, number][] = [
      [-sx, -sz],
      [sx, -sz],
      [sx, sz],
      [-sx, sz],
    ];
    corners.forEach(([x, z]) => addSeg([x, sBase, z], [x, sTop, z]));
    [sBase, -0.3, 1.0].forEach((y) => {
      for (let i = 0; i < 4; i++) {
        const [x1, z1] = corners[i];
        const [x2, z2] = corners[(i + 1) % 4];
        addSeg([x1, y, z1], [x2, y, z2]);
      }
    });
    // A couple of diagonal braces on the front face for scaffold texture.
    addSeg([-sx, sBase, sz], [sx, 1.0, sz]);
    addSeg([sx, sBase, sz], [-sx, 1.0, sz]);
    const scaffoldGeo = new THREE.BufferGeometry();
    scaffoldGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(scaffoldPts, 3)
    );
    const scaffold = new THREE.LineSegments(
      scaffoldGeo,
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0 })
    );
    group.add(scaffold);

    // Faint blueprint grid — a "site plan" beneath the model.
    const grid = new THREE.GridHelper(6.5, 13, 0xd8c3a5, 0xd8c3a5);
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.18;
    grid.position.y = -1.42;
    scene.add(grid);

    // ---- Entrance sequence: foundation drops in → walls rise as
    // scaffolding goes up around them → the extension grows out of the
    // wall face → the roof settles on and the line-work warms from
    // rough grey to finished gold → windows fade in → scaffolding comes
    // back down. A sequenced renovation, not a single fade-in.
    const structuralPieces = [foundation, walls, roof];
    const restY = structuralPieces.map((p) => p.position.y);

    structuralPieces.forEach((p) => {
      p.position.y -= reduceMotion ? 0 : 1.1;
      (fillOf(p).material as THREE.Material).opacity = reduceMotion ? 0.045 : 0;
      (edgesOf(p).material as THREE.Material).opacity = reduceMotion ? 0.85 : 0;
    });

    if (reduceMotion) {
      // Skip the sequence — land straight on the finished state.
      extension.scale.set(1, 1, 1);
      [windowA, windowB, windowC].forEach((w) => {
        (w.material as THREE.Material).opacity = 0.85;
      });
      (scaffold.material as THREE.Material).opacity = 0;
      [foundation, walls, roof, extension].forEach((p) => {
        (edgesOf(p).material as THREE.LineBasicMaterial).color.setRGB(
          GOLD_RGB.r,
          GOLD_RGB.g,
          GOLD_RGB.b
        );
      });
    }

    let entered = false;
    let entranceTl: gsap.core.Timeline | null = null;
    const enterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entered || reduceMotion) return;
          entered = true;

          const tl = gsap.timeline();
          entranceTl = tl;

          // Foundation drops in.
          tl.to(foundation.position, { y: restY[0], duration: 0.8, ease: "power3.out" }, 0)
            .to(fillOf(foundation).material, { opacity: 0.045, duration: 0.7 }, 0)
            .to(edgesOf(foundation).material, { opacity: 0.85, duration: 0.7 }, 0);

          // Walls rise; scaffolding goes up around them at the same time.
          tl.to(walls.position, { y: restY[1], duration: 0.85, ease: "power3.out" }, 0.45)
            .to(fillOf(walls).material, { opacity: 0.045, duration: 0.75 }, 0.45)
            .to(edgesOf(walls).material, { opacity: 0.85, duration: 0.75 }, 0.45)
            .to(scaffold.material, { opacity: 0.7, duration: 0.6 }, 0.55);

          // The extension grows out from the wall face — "Add & Adapt".
          tl.to(
            extension.scale,
            { x: 1, y: 1, z: 1, duration: 0.75, ease: "back.out(1.4)" },
            1.05
          );

          // Roof settles on.
          tl.to(roof.position, { y: restY[2], duration: 0.75, ease: "power3.out" }, 1.55)
            .to(fillOf(roof).material, { opacity: 0.045, duration: 0.6 }, 1.55)
            .to(edgesOf(roof).material, { opacity: 0.85, duration: 0.6 }, 1.55);

          // The whole structure's line-work warms from rough grey to
          // finished gold — the "build complete" beat. Tweened on each
          // material's own Color object (gsap can animate .r/.g/.b
          // directly), timed to land alongside the roof settling on.
          [foundation, walls, roof, extension].forEach((p) => {
            const mat = edgesOf(p).material as THREE.LineBasicMaterial;
            gsap.to(mat.color, {
              r: GOLD_RGB.r,
              g: GOLD_RGB.g,
              b: GOLD_RGB.b,
              duration: 0.8,
              ease: "power2.out",
              delay: 1.75,
            });
          });

          // Windows fade in as the last fit-out touch.
          tl.to(
            [windowA.material, windowB.material, windowC.material],
            { opacity: 0.85, duration: 0.5, stagger: 0.1 },
            2.15
          );

          // Scaffolding comes back down, revealing the finished home.
          tl.to(scaffold.material, { opacity: 0, duration: 0.6, ease: "power2.out" }, 2.6);
        });
      },
      { threshold: 0.25 }
    );
    enterObserver.observe(container);

    // ---- Ambient rotation + pointer tilt.
    let frameId = 0;
    let targetTiltX = 0;
    let targetTiltZ = 0;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltZ = px * 0.18;
      targetTiltX = py * -0.12;
    };
    const handleLeave = () => {
      targetTiltX = 0;
      targetTiltZ = 0;
    };
    if (canHover && !reduceMotion) {
      container.addEventListener("mousemove", handleMove);
      container.addEventListener("mouseleave", handleLeave);
    }

    const animate = () => {
      if (!reduceMotion) {
        group.rotation.y += 0.0022;
      }
      group.rotation.x += (targetTiltX - group.rotation.x) * 0.06;
      group.rotation.z += (targetTiltZ - group.rotation.z) * 0.06;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // ---- Responsive sizing.
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      width = w;
      height = h;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      enterObserver.disconnect();
      entranceTl?.kill();
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const words = SUBTITLE.split(" ");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="bg-white px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1320px]">
        <div className="mb-12 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <header className="max-w-[640px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              What We Do
            </span>
            <h2
              id="services-heading"
              className="mb-3 text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.14] tracking-[-0.02em] text-[#1C1712]"
            >
              Our Services
            </h2>
            <p
              ref={subtitleRef}
              className="py-1 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.6] text-[#6E6259]"
            >
              {words.map((word, wi) => (
                <Fragment key={wi}>
                  <span className="inline-block">
                    {word.split("").map((char, ci) => (
                      <span key={ci} data-letter className="inline-block">
                        {char}
                      </span>
                    ))}
                  </span>
                  {wi < words.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </p>
            <div
              aria-hidden="true"
              className="mt-7 h-px w-full max-w-[220px] bg-[repeating-linear-gradient(90deg,rgba(162,96,40,0.55)_0px,rgba(162,96,40,0.55)_6px,transparent_6px,transparent_14px)]"
            />
          </header>

          {/* 3D massing model — a house that visibly goes through a
              renovation (scaffold up, extension grows out, roof settles,
              line-work warms to gold, windows fit out, scaffold comes
              down) as the section scrolls into view. Purely decorative. */}
          <div
            ref={modelContainerRef}
            aria-hidden="true"
            className="relative h-[240px] w-full shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF7F2] to-white ring-1 ring-[#1C1712]/[0.05] sm:h-[300px] lg:h-[340px] lg:w-[380px] xl:h-[380px] xl:w-[420px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-7 xl:grid-cols-4">
          {FEATURED_SERVICES.map((service, i) => (
            <a
              key={service.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={service.href}
              onMouseEnter={() => hoverTimelines.current[i]?.play()}
              onMouseLeave={() => hoverTimelines.current[i]?.reverse()}
              onFocus={() => hoverTimelines.current[i]?.play()}
              onBlur={() => hoverTimelines.current[i]?.reverse()}
              className="group relative block overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(28,23,18,0.05),0_1px_0_rgba(28,23,18,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_28px_56px_-20px_rgba(28,23,18,0.28),0_8px_20px_-8px_rgba(162,96,40,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26028]"
            >
              {/* Two-stage border: a quiet hairline at rest, a gold edge
                  that fades in on hover/focus — drawn as its own layer so
                  the transition is a clean crossfade, not a color snap. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl border border-[#1C1712]/10"
              />
              <span
                data-card-border
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl border border-[#A26028]/50 opacity-0"
              />

              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  data-card-image
                  src={service.image}
                  alt={`${service.title} project by BSL Construction`}
                  fill
                  sizes="(min-width: 1280px) 23vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />

                {/* Permanent quiet base gradient keeps the frame grounded
                    even at rest; the scrim layer deepens it on hover. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent"
                />
                <div
                  data-card-scrim
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
                />

                {/* Blueprint-style corner registration marks — the
                    signature detail, in a warm gold rather than plain
                    white. Drawn in by the GSAP hover timeline. */}
                <svg
                  className="pointer-events-none absolute inset-2.5 h-[calc(100%-1.25rem)] w-[calc(100%-1.25rem)]"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    data-card-corner
                    d="M 1 16 L 1 1 L 16 1"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                  <path
                    data-card-corner
                    d="M 84 1 L 99 1 L 99 16"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                  <path
                    data-card-corner
                    d="M 99 84 L 99 99 L 84 99"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                  <path
                    data-card-corner
                    d="M 16 99 L 1 99 L 1 84"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                </svg>

                {/* "Discover more" badge — appears centered over the image
                    on hover/focus, the premium hover cue on top of the
                    always-visible text link below. */}
                <div
                  data-card-badge
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    Discover more
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="px-5 pb-6 pt-5">
                <span className="mb-2 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                  {service.kicker}
                  <span aria-hidden="true" className="h-px flex-1 bg-[#A26028]/25" />
                </span>
                <h3 className="mb-1.5 text-[1.1rem] font-bold leading-[1.28] tracking-[-0.01em] text-[#1C1712] lg:text-[1.2rem]">
                  {service.title}
                </h3>
                <p className="mb-4 text-[0.85rem] leading-[1.55] text-[#6E6259]">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.02em] text-[#A26028]">
                  View the work
                  <svg
                    data-card-arrow
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* ---- Section break — a printer's/drafting registration mark
            (a small ring + crosshair) flanked by two hairlines that draw
            in from the center outward on scroll. It's a direct callback
            to the corner-registration brackets on the cards above, reused
            here to mark a real seam in the content: from "the four
            flagship builds" to "everything else we handle." */}
        <div
          ref={dividerRef}
          aria-hidden="true"
          className="my-14 flex items-center gap-5 lg:my-16 lg:gap-7"
        >
          <span
            data-divider-line
            className="h-px flex-1 origin-right scale-x-0 bg-gradient-to-r from-transparent to-[#1C1712]/15"
          />
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#A26028]/30 bg-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle
                data-divider-ring
                cx="12"
                cy="12"
                r="7"
                stroke="#A26028"
                strokeWidth="1.3"
                className="fill-none opacity-0 [stroke-dasharray:44] [stroke-dashoffset:44]"
              />
              <path
                data-divider-cross
                d="M12 2 V6 M12 18 V22 M2 12 H6 M18 12 H22"
                stroke="#A26028"
                strokeWidth="1.3"
                strokeLinecap="round"
                className="opacity-0"
              />
            </svg>
          </span>
          <span
            data-divider-line
            className="h-px flex-1 origin-left scale-x-0 bg-gradient-to-l from-transparent to-[#1C1712]/15"
          />
        </div>

        {/* ---- Maintenance & Trades — a softly tinted panel, a shade
            warmer than the page's white, so this reads as a distinct,
            calmer tier: a supporting spec sheet rather than a second row
            of portfolio work. The white tiles inside keep a hairline
            border and a subtle lift/border-warm on hover, matching the
            brand palette without competing for attention against the
            flagship cards above. */}
        <div className="rounded-[28px] bg-[#FAF7F2] px-6 py-10 ring-1 ring-[#1C1712]/[0.05] lg:px-10 lg:py-12">
          <header className="mb-8 max-w-[640px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              Maintenance & Trades
            </span>
            <h3 className="text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-[1.2] tracking-[-0.02em] text-[#1C1712]">
              Every trade, covered
            </h3>
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {MAINTENANCE_SERVICES.map((service) => (
              <a
                key={service.id}
                href={service.href}
                className="group flex items-center justify-between rounded-xl border border-[#1C1712]/10 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(28,23,18,0.05)] transition-all duration-200 ease-out hover:border-[#A26028]/40 hover:shadow-[0_10px_24px_-10px_rgba(28,23,18,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26028]"
              >
                <span className="text-[0.92rem] font-semibold text-[#1C1712]">
                  {service.title}
                </span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#A26028] transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
                >
                  <path
                    d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center lg:mt-14">
          <a
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[#1C1712] px-7 py-3.5 text-sm font-semibold text-[#1C1712] transition-colors duration-200 ease-out hover:bg-[#1C1712] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1712]"
          >
            Discover all services
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}