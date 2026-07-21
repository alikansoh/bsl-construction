"use client";

/**
 * Services.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Homepage Services Section
 *
 * Main service categories:
 *
 * 01 — Construction
 *     New Builds
 *     Extensions
 *     Loft Conversions
 *     Basement Conversions
 *     Refurbishments
 *     Kitchens & Bathrooms
 *     Roofing
 *
 * 02 — Mechanical & Electrical
 *     Plumbing
 *     Heating & Boilers
 *     Heat Pumps
 *     Gas Services
 *     Air Conditioning
 *     Electrical
 *     Water Regulations
 *     RPZ Testing
 *
 * 03 — Commercial
 *     Hotel Maintenance
 *     Commercial Maintenance
 *     Planned Maintenance
 *     Reactive Maintenance
 *     Emergency Call-Outs
 *     Facilities Support
 *
 * The homepage presents the three main capabilities.
 * Individual services are handled on their own category/service pages.
 *
 * Requires:
 *   npm install gsap three
 */

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ServiceCategory = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  description: string;
  image: string;
  href: string;
  services: string[];
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "construction",
    number: "01",
    kicker: "Construction",
    title: "Construction",
    description:
      "From new builds and extensions to conversions, refurbishments, kitchens, bathrooms and roofing.",
    image: "/building.jpg",
    href: "/services/construction",
    services: [
      "New Builds",
      "Extensions",
      "Loft Conversions",
      "Basement Conversions",
      "Refurbishments",
      "Kitchens & Bathrooms",
      "Roofing",
    ],
  },
  {
    id: "mechanical-electrical",
    number: "02",
    kicker: "Mechanical & Electrical",
    title: "Mechanical & Electrical",
    description:
      "Complete mechanical and electrical services covering plumbing, heating, gas, air conditioning and electrical systems.",
    image: "/main.jpg",
    href: "/services/mechanical-electrical",
    services: [
      "Plumbing",
      "Heating & Boilers",
      "Heat Pumps",
      "Gas Services",
      "Air Conditioning",
      "Electrical",
      "Water Regulations",
      "RPZ Testing",
    ],
  },
  {
    id: "commercial",
    number: "03",
    kicker: "Commercial",
    title: "Commercial",
    description:
      "Reliable maintenance and facilities support for hotels, commercial properties and managed buildings.",
    image: "/com.jpg",
    href: "/services/commercial",
    services: [
      "Hotel Maintenance",
      "Commercial Maintenance",
      "Planned Maintenance",
      "Reactive Maintenance",
      "Emergency Call-Outs",
      "Facilities Support",
    ],
  },
];

const SUBTITLE =
  "Complete building, mechanical and commercial services under one roof.";

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimelines = useRef<(gsap.core.Timeline | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const modelContainerRef = useRef<HTMLDivElement>(null);

  // -----------------------------------------------------------------------
  // CARD ANIMATIONS
  // -----------------------------------------------------------------------

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

      // ---------------------------------------------------------------
      // Initial state
      // ---------------------------------------------------------------

      gsap.set(card, {
        opacity: reduceMotion ? 1 : 0,
        y: reduceMotion ? 0 : 30,
        transformPerspective: 1000,
      });

      gsap.set(image, {
        clipPath: reduceMotion
          ? "inset(0% 0% 0% 0%)"
          : "inset(0% 0% 100% 0%)",
        scale: reduceMotion ? 1.03 : 1.12,
      });

      gsap.set(corners, {
        opacity: 0,
      });

      gsap.set(badge, {
        opacity: 0,
        scale: 0.7,
        y: 10,
      });

      gsap.set(scrim, {
        opacity: 0,
      });

      // ---------------------------------------------------------------
      // Scroll reveal
      // ---------------------------------------------------------------

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,

          onEnter: () => {
            const delay = reduceMotion ? 0 : i * 0.12;

            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0.01 : 0.8,
              ease: "power3.out",
              delay,
            });

            gsap.to(image, {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1.03,
              duration: reduceMotion ? 0.01 : 1.1,
              ease: "power3.out",
              delay,
            });
          },
        })
      );

      // ---------------------------------------------------------------
      // Image parallax
      // ---------------------------------------------------------------

      if (!reduceMotion) {
        parallaxTriggers.push(
          ScrollTrigger.create({
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,

            onUpdate: (self) => {
              gsap.set(image, {
                y: (self.progress - 0.5) * 28,
              });
            },
          })
        );
      }

      // ---------------------------------------------------------------
      // Hover timeline
      // ---------------------------------------------------------------

      const tl = gsap.timeline({
        paused: true,
        defaults: {
          ease: "power2.out",
        },
      });

      tl.to(
        card,
        {
          y: reduceMotion ? 0 : -7,
          scale: reduceMotion ? 1 : 1.015,
          duration: reduceMotion ? 0.01 : 0.5,
        },
        0
      )
        .to(
          image,
          {
            scale: reduceMotion ? 1.03 : 1.13,
            duration: reduceMotion ? 0.01 : 0.9,
          },
          0
        )
        .to(
          scrim,
          {
            opacity: reduceMotion ? 0 : 0.45,
            duration: reduceMotion ? 0.01 : 0.45,
          },
          0
        )
        .to(
          border,
          {
            opacity: 1,
            duration: reduceMotion ? 0.01 : 0.4,
          },
          0
        )
        .to(
          badge,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: reduceMotion ? 0.01 : 0.4,
          },
          0.05
        )
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
        .to(
          arrow,
          {
            x: reduceMotion ? 0 : 4,
            duration: reduceMotion ? 0.01 : 0.25,
          },
          0.1
        );

      hoverTimelines.current[i] = tl;

      // ---------------------------------------------------------------
      // Pointer tilt
      // ---------------------------------------------------------------

      if (canHover && !reduceMotion) {
        const rotateX = gsap.quickTo(card, "rotateX", {
          duration: 0.6,
          ease: "power3.out",
        });

        const rotateY = gsap.quickTo(card, "rotateY", {
          duration: 0.6,
          ease: "power3.out",
        });

        const handleMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();

          const px =
            (e.clientX - rect.left) / rect.width - 0.5;

          const py =
            (e.clientY - rect.top) / rect.height - 0.5;

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
      scrollTriggers.forEach((trigger) => trigger.kill());
      parallaxTriggers.forEach((trigger) => trigger.kill());

      hoverTimelines.current.forEach((timeline) => {
        timeline?.kill();
      });

      hoverTimelines.current = [];

      moveCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // -----------------------------------------------------------------------
  // SUBTITLE WAVE
  // -----------------------------------------------------------------------

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
      y: -3,
      rotate: 2,
      duration: 1.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.03,
        yoyo: true,
        repeat: -1,
      },
    });

    return () => {
      tween.kill();

      gsap.set(letters, {
        clearProps: "transform",
      });
    };
  }, []);

  // -----------------------------------------------------------------------
  // DIVIDER ANIMATION
  // -----------------------------------------------------------------------

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
      gsap.set(lines, {
        scaleX: 1,
      });

      gsap.set(ring, {
        opacity: 1,
        strokeDashoffset: 0,
      });

      gsap.set(cross, {
        opacity: 1,
      });

      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: divider,
      start: "top 90%",
      once: true,

      onEnter: () => {
        gsap.to(lines, {
          scaleX: 1,
          duration: 0.9,
          ease: "power3.out",
        });

        gsap.to(ring, {
          opacity: 1,
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.15,
        });

        gsap.to(cross, {
          opacity: 1,
          duration: 0.35,
          delay: 0.5,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // -----------------------------------------------------------------------
  // THREE.JS HOUSE MODEL
  // -----------------------------------------------------------------------

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

    const camera = new THREE.PerspectiveCamera(
      35,
      width / height,
      0.1,
      100
    );

    camera.position.set(4.2, 3.1, 5.6);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setClearColor(0x000000, 0);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(width, height);

    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    // ---------------------------------------------------------------
    // Lighting
    // ---------------------------------------------------------------

    const ambient = new THREE.AmbientLight(
      0xffffff,
      0.95
    );

    const key = new THREE.DirectionalLight(
      0xffffff,
      0.6
    );

    key.position.set(3, 5, 4);

    scene.add(ambient, key);

    // ---------------------------------------------------------------
    // Main group
    // ---------------------------------------------------------------

    const group = new THREE.Group();

    group.rotation.y = -0.5;

    scene.add(group);

    const ROUGH = 0x9a948c;
    const GOLD = 0xa26028;

    const GOLD_RGB = {
      r: 162 / 255,
      g: 96 / 255,
      b: 40 / 255,
    };

    const FILL = 0x1c1712;

    // ---------------------------------------------------------------
    // Create structural piece
    // ---------------------------------------------------------------

    const makePiece = (
      geometry: THREE.BufferGeometry,
      edgeColor = ROUGH
    ) => {
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
        new THREE.EdgesGeometry(
          geometry,
          20
        ),
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

    const fillOf = (piece: THREE.Object3D) =>
      piece.children[0] as THREE.Mesh;

    const edgesOf = (piece: THREE.Object3D) =>
      piece.children[1] as THREE.LineSegments;

    // ---------------------------------------------------------------
    // Foundation
    // ---------------------------------------------------------------

    const foundation = makePiece(
      new THREE.BoxGeometry(
        3.2,
        0.4,
        2.2
      )
    );

    foundation.position.set(
      0,
      -1.2,
      0
    );

    // ---------------------------------------------------------------
    // Main walls
    // ---------------------------------------------------------------

    const walls = makePiece(
      new THREE.BoxGeometry(
        2.8,
        1.6,
        1.8
      )
    );

    walls.position.set(
      0,
      -0.2,
      0
    );

    // ---------------------------------------------------------------
    // Roof
    // ---------------------------------------------------------------

    const roofShape = new THREE.Shape();

    roofShape.moveTo(-1.5, 0);
    roofShape.lineTo(0, 1.05);
    roofShape.lineTo(1.5, 0);
    roofShape.lineTo(-1.5, 0);

    const roofGeo = new THREE.ExtrudeGeometry(
      roofShape,
      {
        depth: 1.9,
        bevelEnabled: false,
      }
    );

    roofGeo.translate(
      0,
      0,
      -0.95
    );

    const roof = makePiece(
      roofGeo
    );

    roof.position.set(
      0,
      0.6,
      0
    );

    // ---------------------------------------------------------------
    // Extension
    // ---------------------------------------------------------------

    const extW = 1.05;
    const extH = 1;
    const extD = 1.4;

    const extGeo = new THREE.BoxGeometry(
      extW,
      extH,
      extD
    );

    extGeo.translate(
      extW / 2,
      extH / 2,
      0
    );

    const extension = makePiece(
      extGeo
    );

    extension.position.set(
      1.4,
      -1,
      0
    );

    extension.scale.set(
      0.001,
      0.001,
      0.001
    );

    group.add(
      foundation,
      walls,
      roof,
      extension
    );

    // ---------------------------------------------------------------
    // Windows
    // ---------------------------------------------------------------

    const makeWindow = (
      w: number,
      h: number
    ) => {
      const geo = new THREE.BoxGeometry(
        w,
        h,
        0.02
      );

      return new THREE.LineSegments(
        new THREE.EdgesGeometry(
          geo,
          1
        ),
        new THREE.LineBasicMaterial({
          color: GOLD,
          transparent: true,
          opacity: 0,
        })
      );
    };

    const windowA = makeWindow(
      0.42,
      0.5
    );

    windowA.position.set(
      -0.55,
      -0.1,
      0.91
    );

    const windowB = makeWindow(
      0.42,
      0.5
    );

    windowB.position.set(
      0.55,
      -0.1,
      0.91
    );

    const windowC = makeWindow(
      0.34,
      0.4
    );

    windowC.position.set(
      1.925,
      -0.5,
      0.71
    );

    group.add(
      windowA,
      windowB,
      windowC
    );

    // ---------------------------------------------------------------
    // Scaffolding
    // ---------------------------------------------------------------

    const scaffoldPts: number[] = [];

    const addSeg = (
      a: [number, number, number],
      b: [number, number, number]
    ) => {
      scaffoldPts.push(
        ...a,
        ...b
      );
    };

    const sx = 1.62;
    const sz = 1.06;

    const sBase = -1;
    const sTop = 1.75;

    const scaffoldCorners: [number, number][] = [
      [-sx, -sz],
      [sx, -sz],
      [sx, sz],
      [-sx, sz],
    ];

    scaffoldCorners.forEach(
      ([x, z]) => {
        addSeg(
          [x, sBase, z],
          [x, sTop, z]
        );
      }
    );

    [
      sBase,
      -0.3,
      1,
    ].forEach((y) => {
      for (
        let i = 0;
        i < 4;
        i++
      ) {
        const [
          x1,
          z1,
        ] =
          scaffoldCorners[i];

        const [
          x2,
          z2,
        ] =
          scaffoldCorners[
            (i + 1) % 4
          ];

        addSeg(
          [x1, y, z1],
          [x2, y, z2]
        );
      }
    });

    addSeg(
      [
        -sx,
        sBase,
        sz,
      ],
      [
        sx,
        1,
        sz,
      ]
    );

    addSeg(
      [
        sx,
        sBase,
        sz,
      ],
      [
        -sx,
        1,
        sz,
      ]
    );

    const scaffoldGeo =
      new THREE.BufferGeometry();

    scaffoldGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        scaffoldPts,
        3
      )
    );

    const scaffold =
      new THREE.LineSegments(
        scaffoldGeo,
        new THREE.LineBasicMaterial({
          color: GOLD,
          transparent: true,
          opacity: 0,
        })
      );

    group.add(
      scaffold
    );

    // ---------------------------------------------------------------
    // Blueprint grid
    // ---------------------------------------------------------------

    const grid =
      new THREE.GridHelper(
        6.5,
        13,
        0xd8c3a5,
        0xd8c3a5
      );

    const gridMaterial =
      grid.material as THREE.Material;

    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.18;

    grid.position.y = -1.42;

    scene.add(grid);

    // ---------------------------------------------------------------
    // Entrance animation
    // ---------------------------------------------------------------

    const structuralPieces = [
      foundation,
      walls,
      roof,
    ];

    const restY =
      structuralPieces.map(
        (piece) =>
          piece.position.y
      );

    structuralPieces.forEach(
      (piece) => {
        piece.position.y -=
          reduceMotion
            ? 0
            : 1.1;

        (
          fillOf(piece)
            .material as THREE.Material
        ).opacity =
          reduceMotion
            ? 0.045
            : 0;

        (
          edgesOf(piece)
            .material as THREE.Material
        ).opacity =
          reduceMotion
            ? 0.85
            : 0;
      }
    );

    if (reduceMotion) {
      extension.scale.set(
        1,
        1,
        1
      );

      [
        windowA,
        windowB,
        windowC,
      ].forEach((window) => {
        (
          window.material as THREE.Material
        ).opacity = 0.85;
      });

      (
        scaffold.material as THREE.Material
      ).opacity = 0;

      [
        foundation,
        walls,
        roof,
        extension,
      ].forEach((piece) => {
        (
          edgesOf(piece)
            .material as THREE.LineBasicMaterial
        ).color.setRGB(
          GOLD_RGB.r,
          GOLD_RGB.g,
          GOLD_RGB.b
        );
      });
    }

    let entered = false;

    let entranceTl:
      | gsap.core.Timeline
      | null = null;

    const enterObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting ||
                entered ||
                reduceMotion
              ) {
                return;
              }

              entered = true;

              const tl =
                gsap.timeline();

              entranceTl = tl;

              // Foundation
              tl.to(
                foundation.position,
                {
                  y: restY[0],
                  duration: 0.8,
                  ease: "power3.out",
                },
                0
              )
                .to(
                  fillOf(
                    foundation
                  ).material,
                  {
                    opacity: 0.045,
                    duration: 0.7,
                  },
                  0
                )
                .to(
                  edgesOf(
                    foundation
                  ).material,
                  {
                    opacity: 0.85,
                    duration: 0.7,
                  },
                  0
                );

              // Walls + scaffold
              tl.to(
                walls.position,
                {
                  y: restY[1],
                  duration: 0.85,
                  ease: "power3.out",
                },
                0.45
              )
                .to(
                  fillOf(
                    walls
                  ).material,
                  {
                    opacity: 0.045,
                    duration: 0.75,
                  },
                  0.45
                )
                .to(
                  edgesOf(
                    walls
                  ).material,
                  {
                    opacity: 0.85,
                    duration: 0.75,
                  },
                  0.45
                )
                .to(
                  scaffold.material,
                  {
                    opacity: 0.7,
                    duration: 0.6,
                  },
                  0.55
                );

              // Extension
              tl.to(
                extension.scale,
                {
                  x: 1,
                  y: 1,
                  z: 1,
                  duration: 0.75,
                  ease: "back.out(1.4)",
                },
                1.05
              );

              // Roof
              tl.to(
                roof.position,
                {
                  y: restY[2],
                  duration: 0.75,
                  ease: "power3.out",
                },
                1.55
              )
                .to(
                  fillOf(
                    roof
                  ).material,
                  {
                    opacity: 0.045,
                    duration: 0.6,
                  },
                  1.55
                )
                .to(
                  edgesOf(
                    roof
                  ).material,
                  {
                    opacity: 0.85,
                    duration: 0.6,
                  },
                  1.55
                );

              // Warm gold finish
              [
                foundation,
                walls,
                roof,
                extension,
              ].forEach(
                (piece) => {
                  const material =
                    edgesOf(
                      piece
                    ).material as THREE.LineBasicMaterial;

                  gsap.to(
                    material.color,
                    {
                      r: GOLD_RGB.r,
                      g: GOLD_RGB.g,
                      b: GOLD_RGB.b,
                      duration: 0.8,
                      ease: "power2.out",
                      delay: 1.75,
                    }
                  );
                }
              );

              // Windows
              tl.to(
                [
                  windowA.material,
                  windowB.material,
                  windowC.material,
                ],
                {
                  opacity: 0.85,
                  duration: 0.5,
                  stagger: 0.1,
                },
                2.15
              );

              // Scaffold comes down
              tl.to(
                scaffold.material,
                {
                  opacity: 0,
                  duration: 0.6,
                  ease: "power2.out",
                },
                2.6
              );
            }
          );
        },
        {
          threshold: 0.25,
        }
      );

    enterObserver.observe(
      container
    );

    // ---------------------------------------------------------------
    // Ambient rotation
    // ---------------------------------------------------------------

    let frameId = 0;

    let targetTiltX = 0;
    let targetTiltZ = 0;

    const handleMove = (
      e: MouseEvent
    ) => {
      const rect =
        container.getBoundingClientRect();

      const px =
        (e.clientX -
          rect.left) /
          rect.width -
        0.5;

      const py =
        (e.clientY -
          rect.top) /
          rect.height -
        0.5;

      targetTiltZ =
        px * 0.18;

      targetTiltX =
        py * -0.12;
    };

    const handleLeave =
      () => {
        targetTiltX = 0;
        targetTiltZ = 0;
      };

    if (
      canHover &&
      !reduceMotion
    ) {
      container.addEventListener(
        "mousemove",
        handleMove
      );

      container.addEventListener(
        "mouseleave",
        handleLeave
      );
    }

    const animate =
      () => {
        if (!reduceMotion) {
          group.rotation.y +=
            0.0022;
        }

        group.rotation.x +=
          (targetTiltX -
            group.rotation.x) *
          0.06;

        group.rotation.z +=
          (targetTiltZ -
            group.rotation.z) *
          0.06;

        renderer.render(
          scene,
          camera
        );

        frameId =
          requestAnimationFrame(
            animate
          );
      };

    animate();

    // ---------------------------------------------------------------
    // Responsive sizing
    // ---------------------------------------------------------------

    const resizeObserver =
      new ResizeObserver(
        () => {
          const w =
            container.clientWidth;

          const h =
            container.clientHeight;

          if (
            w === 0 ||
            h === 0
          ) {
            return;
          }

          width = w;
          height = h;

          camera.aspect =
            width / height;

          camera.updateProjectionMatrix();

          renderer.setSize(
            width,
            height
          );
        }
      );

    resizeObserver.observe(
      container
    );

    // ---------------------------------------------------------------
    // Cleanup
    // ---------------------------------------------------------------

    return () => {
      cancelAnimationFrame(
        frameId
      );

      resizeObserver.disconnect();

      enterObserver.disconnect();

      entranceTl?.kill();

      container.removeEventListener(
        "mousemove",
        handleMove
      );

      container.removeEventListener(
        "mouseleave",
        handleLeave
      );

      scene.traverse(
        (object) => {
          if (
            object instanceof
              THREE.Mesh ||
            object instanceof
              THREE.LineSegments
          ) {
            object.geometry.dispose();

            const material =
              object.material;

            if (
              Array.isArray(
                material
              )
            ) {
              material.forEach(
                (mat) =>
                  mat.dispose()
              );
            } else {
              material.dispose();
            }
          }
        }
      );

      renderer.dispose();

      if (
        renderer.domElement
          .parentNode ===
        container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // SUBTITLE LETTERS
  // -----------------------------------------------------------------------

  const words =
    SUBTITLE.split(" ");

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <section
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="bg-white px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1320px]">

        {/* ============================================================= */}
        {/* HEADER + 3D MODEL */}
        {/* ============================================================= */}

        <div className="mb-12 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12">

          <header className="max-w-[650px]">

            <span className="mb-3 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-[#A26028]"
              />

              What We Do
            </span>

            <h2
              id="services-heading"
              className="mb-4 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#1C1712]"
            >
              Our Services
            </h2>

            <p
              ref={subtitleRef}
              className="py-1 text-[clamp(0.95rem,1.6vw,1.08rem)] leading-[1.65] text-[#6E6259]"
            >
              {words.map(
                (
                  word,
                  wordIndex
                ) => (
                  <Fragment
                    key={
                      wordIndex
                    }
                  >
                    <span className="inline-block">
                      {word
                        .split(
                          ""
                        )
                        .map(
                          (
                            char,
                            charIndex
                          ) => (
                            <span
                              key={
                                charIndex
                              }
                              data-letter
                              className="inline-block"
                            >
                              {
                                char
                              }
                            </span>
                          )
                        )}
                    </span>

                    {wordIndex <
                      words.length -
                        1
                      ? " "
                      : ""}
                  </Fragment>
                )
              )}
            </p>

            <div
              aria-hidden="true"
              className="mt-7 h-px w-full max-w-[220px] bg-[repeating-linear-gradient(90deg,rgba(162,96,40,0.55)_0px,rgba(162,96,40,0.55)_6px,transparent_6px,transparent_14px)]"
            />

          </header>

          {/* =========================================================== */}
          {/* 3D HOUSE MODEL */}
          {/* =========================================================== */}

          <div
            ref={
              modelContainerRef
            }
            aria-hidden="true"
            className="relative h-[240px] w-full shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF7F2] to-white ring-1 ring-[#1C1712]/[0.05] sm:h-[300px] lg:h-[340px] lg:w-[380px] xl:h-[380px] xl:w-[420px]"
          />

        </div>

        {/* ============================================================= */}
        {/* MAIN 3 SERVICE CATEGORY CARDS */}
        {/* ============================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">

          {SERVICE_CATEGORIES.map(
            (
              service,
              index
            ) => (
              <Link
                key={
                  service.id
                }
                ref={(
                  element
                ) => {
                  cardRefs.current[
                    index
                  ] = element;
                }}
                href={
                  service.href
                }
                onMouseEnter={() =>
                  hoverTimelines.current[
                    index
                  ]?.play()
                }
                onMouseLeave={() =>
                  hoverTimelines.current[
                    index
                  ]?.reverse()
                }
                onFocus={() =>
                  hoverTimelines.current[
                    index
                  ]?.play()
                }
                onBlur={() =>
                  hoverTimelines.current[
                    index
                  ]?.reverse()
                }
                className="group relative block overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(28,23,18,0.05),0_1px_0_rgba(28,23,18,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26028]"
              >

                {/* =================================================== */}
                {/* BORDER */}
                {/* =================================================== */}

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 rounded-2xl border border-[#1C1712]/10"
                />

                <span
                  data-card-border
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 rounded-2xl border border-[#A26028]/60 opacity-0"
                />

                {/* =================================================== */}
                {/* IMAGE */}
                {/* =================================================== */}

                <div className="relative aspect-[4/5] overflow-hidden">

                  <Image
                    data-card-image
                    src={
                      service.image
                    }
                    alt={`${service.title} services by BSL Construction`}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />

                  {/* Base gradient */}

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                  />

                  {/* Hover scrim */}

                  <div
                    data-card-scrim
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                  />

                  {/* ================================================= */}
                  {/* CORNER REGISTRATION MARKS */}
                  {/* ================================================= */}

                  <svg
                    className="pointer-events-none absolute inset-2.5 h-[calc(100%-1.25rem)] w-[calc(100%-1.25rem)]"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {[
                      "M 1 16 L 1 1 L 16 1",
                      "M 84 1 L 99 1 L 99 16",
                      "M 99 84 L 99 99 L 84 99",
                      "M 16 99 L 1 99 L 1 84",
                    ].map(
                      (
                        path,
                        pathIndex
                      ) => (
                        <path
                          key={
                            pathIndex
                          }
                          data-card-corner
                          d={path}
                          strokeWidth={
                            1.5
                          }
                          strokeLinecap="round"
                          className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                        />
                      )
                    )}
                  </svg>

                  {/* ================================================= */}
                  {/* DISCOVER BADGE */}
                  {/* ================================================= */}

                  <div
                    data-card-badge
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md">
                      Explore Category

                      <svg
                        width="11"
                        height="11"
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

                  {/* ================================================= */}
                  {/* CATEGORY NUMBER */}
                  {/* ================================================= */}

                  <div className="absolute left-5 top-5 text-[0.68rem] font-semibold tracking-[0.18em] text-white/80">
                    {service.number}
                  </div>

                </div>

                {/* ===================================================== */}
                {/* CARD CONTENT */}
                {/* ===================================================== */}

                <div className="px-5 pb-7 pt-6">

                  <span className="mb-2 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                    {service.kicker}

                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-[#A26028]/25"
                    />
                  </span>

                  <h3 className="mb-2 text-[1.35rem] font-bold leading-[1.25] tracking-[-0.02em] text-[#1C1712]">
                    {service.title}
                  </h3>

                  <p className="mb-5 text-[0.88rem] leading-[1.6] text-[#6E6259]">
                    {
                      service.description
                    }
                  </p>

                  {/* ================================================= */}
                  {/* SERVICE LIST */}
                  {/* ================================================= */}

                  <ul className="mb-6 grid grid-cols-1 gap-y-2 border-t border-[#1C1712]/10 pt-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {service.services.map(
                      (
                        item
                      ) => (
                        <li
                          key={
                            item
                          }
                          className="flex items-center gap-2 text-[0.78rem] font-medium text-[#4F463F]"
                        >
                          <span
                            aria-hidden="true"
                            className="h-1 w-1 shrink-0 rounded-full bg-[#A26028]"
                          />

                          {
                            item
                          }
                        </li>
                      )
                    )}
                  </ul>

                  {/* ================================================= */}
                  {/* LINK CTA */}
                  {/* ================================================= */}

                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.02em] text-[#A26028]">
                    Explore{" "}
                    {
                      service.title
                    }

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

              </Link>
            )
          )}

        </div>

        {/* ============================================================= */}
        {/* SECTION DIVIDER */}
        {/* ============================================================= */}

        <div
          ref={
            dividerRef
          }
          aria-hidden="true"
          className="my-14 flex items-center gap-5 lg:my-16 lg:gap-7"
        >

          <span
            data-divider-line
            className="h-px flex-1 origin-right scale-x-0 bg-gradient-to-r from-transparent to-[#1C1712]/15"
          />

          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#A26028]/30 bg-white">

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
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

        {/* ============================================================= */}
        {/* BOTTOM CTA */}
        {/* ============================================================= */}

        <div className="flex flex-col items-center text-center">

          <span className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            Complete Building Services
          </span>

          <h3 className="max-w-[650px] text-[clamp(1.5rem,3vw,2.2rem)] font-bold leading-[1.2] tracking-[-0.025em] text-[#1C1712]">
            One team. Three core capabilities. Complete project support.
          </h3>

          <p className="mt-4 max-w-[600px] text-[0.92rem] leading-[1.65] text-[#6E6259]">
            From residential construction and mechanical systems to
            commercial maintenance, BSL Construction provides complete
            building services for homes, businesses and commercial
            properties.
          </p>

          <Link
            href="/services"
            className="group mt-7 inline-flex items-center gap-2 rounded-full border-2 border-[#1C1712] px-7 py-3.5 text-sm font-semibold text-[#1C1712] transition-colors duration-200 ease-out hover:bg-[#1C1712] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1712]"
          >
            Discover All Services

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
          </Link>

        </div>

      </div>
    </section>
  );
}