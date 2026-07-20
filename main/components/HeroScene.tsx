/**
 * components/services/HeroScene.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * v2 — the 3D accent now actually *lists the services* instead of being an
 * abstract wireframe shape. It's a slow-rotating carousel of blueprint-style
 * plaques (index number + category + title), built from canvas textures
 * mapped onto flat planes arranged in a ring. Each plaque faces outward
 * (tangent to the circle), so as the group rotates, cards drift into a
 * legible front-facing position and drift back out — like a rotating
 * architect's index rather than a spinning toy.
 *
 * Design intent: professional, quiet, on-brand. Same gold/brass palette and
 * corner-tick motif used across cards/CTA elsewhere on the page. No lighting
 * drama, no bloom — flat unlit materials on canvas-textured planes.
 *
 * - Renders on a transparent canvas so the hero photo + overlay sit behind it.
 * - Hidden on small screens (lg:block) — desktop-only accent.
 * - Respects prefers-reduced-motion by freezing rotation.
 * - Pauses (eases to a stop) on hover/focus so the plaques can be read.
 * - Cleans up renderer/geometry/materials/textures on unmount.
 * -------------------------------------------------------------------------
 */
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface HeroSceneService {
  title: string;
  category?: string;
}

interface HeroSceneProps {
  services: HeroSceneService[];
  /** Canvas font stack — defaults to the site's serif fallback stack. */
  fontFamily?: string;
}

const MAX_PLAQUES = 9;

// --- Canvas helpers --------------------------------------------------------

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wraps text to a max width, hard-capped at maxLines (last line gets an ellipsis if truncated). */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  // If words remain unconsumed, ellipsize the last line.
  const consumed = lines.join(" ").split(" ").length;
  if (consumed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
}

function createPlaqueTexture(
  title: string,
  index: number,
  category: string | undefined,
  fontFamily: string
): THREE.CanvasTexture | null {
  const scale = 2; // supersample for crisp text
  const width = 512 * scale;
  const height = 300 * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const pad = 16 * scale;
  const radius = 16 * scale;

  // Plaque background
  ctx.fillStyle = "rgba(28, 23, 18, 0.84)";
  roundRectPath(ctx, pad, pad, width - pad * 2, height - pad * 2, radius);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(232, 197, 153, 0.5)";
  ctx.lineWidth = 1.5 * scale;
  roundRectPath(ctx, pad, pad, width - pad * 2, height - pad * 2, radius);
  ctx.stroke();

  // Corner tick mark (echoes the blueprint motif used on cards/CTA)
  const inset = pad + 14 * scale;
  const tick = 20 * scale;
  ctx.strokeStyle = "rgba(162, 96, 40, 0.95)";
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(inset, inset + tick);
  ctx.lineTo(inset, inset);
  ctx.lineTo(inset + tick, inset);
  ctx.stroke();

  // Index number
  ctx.fillStyle = "#E8C599";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${24 * scale}px ${fontFamily}`;
  ctx.fillText(String(index + 1).padStart(2, "0"), pad + 24 * scale, pad + 52 * scale);

  // Category, top-right, small caps
  if (category) {
    ctx.fillStyle = "rgba(232, 197, 153, 0.8)";
    ctx.textAlign = "right";
    ctx.font = `600 ${14 * scale}px ${fontFamily}`;
    ctx.fillText(
      category.toUpperCase(),
      width - pad - 22 * scale,
      pad + 44 * scale
    );
    ctx.textAlign = "left";
  }

  // Title, wrapped up to 2 lines, vertically centered in the lower two-thirds
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 ${32 * scale}px ${fontFamily}`;
  wrapText(
    ctx,
    title,
    pad + 24 * scale,
    height / 2 + 26 * scale,
    width - pad * 2 - 48 * scale,
    38 * scale,
    2
  );

  // Thin baseline rule under the title block (matches the gold rule elsewhere)
  ctx.strokeStyle = "rgba(232, 197, 153, 0.4)";
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(pad + 24 * scale, height - pad - 28 * scale);
  ctx.lineTo(pad + 84 * scale, height - pad - 28 * scale);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

// --- Component ---------------------------------------------------------

export default function HeroScene({
  services,
  fontFamily = "Georgia, 'Palatino Linotype', Palatino, serif",
}: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || services.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene / camera / renderer -----------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Group holding the plaque ring -----------------------------
    const group = new THREE.Group();
    scene.add(group);

    const items = services.slice(0, MAX_PLAQUES);
    const count = items.length;
    const radius = 2.9;
    const plaqueWidth = 2.0;
    const plaqueHeight = plaqueWidth * (300 / 512);

    const disposables: Array<{ dispose: () => void }> = [];

    items.forEach((service, i) => {
      const texture = createPlaqueTexture(
        service.title,
        i,
        service.category,
        fontFamily
      );
      if (!texture) return;
      disposables.push(texture);

      const geometry = new THREE.PlaneGeometry(plaqueWidth, plaqueHeight);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.96,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      disposables.push(geometry, material);

      const mesh = new THREE.Mesh(geometry, material);
      const angle = (i / count) * Math.PI * 2;
      mesh.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      // Face outward (normal points from center through the plaque).
      mesh.rotation.y = angle;
      group.add(mesh);
    });

    // Faint guide ring on the ground plane — a quiet "orbit track" cue.
    const ringPoints: THREE.Vector3[] = [];
    const ringSegments = 96;
    for (let i = 0; i <= ringSegments; i++) {
      const a = (i / ringSegments) * Math.PI * 2;
      ringPoints.push(
        new THREE.Vector3(Math.sin(a) * radius, -plaqueHeight / 2 - 0.18, Math.cos(a) * radius)
      );
    }
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#E8C599"),
      transparent: true,
      opacity: 0.18,
    });
    const ringLine = new THREE.LineLoop(ringGeometry, ringMaterial);
    group.add(ringLine);
    disposables.push(ringGeometry, ringMaterial);

    group.rotation.x = 0.12;

    // --- Resize handling -------------------------------------------------
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- Hover/focus pause — let people actually read a plaque ----------
    let targetSpeed = prefersReducedMotion ? 0 : 0.0028;
    let currentSpeed = targetSpeed;
    const handlePointerEnter = () => {
      targetSpeed = prefersReducedMotion ? 0 : 0.0004;
    };
    const handlePointerLeave = () => {
      targetSpeed = prefersReducedMotion ? 0 : 0.0028;
    };
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);

    // --- Animation loop ----------------------------------------------
    let frameId: number;
    const animate = () => {
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;
      group.rotation.y += currentSpeed;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // --- Cleanup -----------------------------------------------------
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [services, fontFamily]);

  return (
    <div
      ref={containerRef}
      role="presentation"
      aria-hidden="true"
      className="pointer-events-auto absolute -right-6 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 lg:block xl:-right-2 xl:h-[480px] xl:w-[480px]"
    />
  );
}