"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowRight, X } from "lucide-react";
import { display, mono } from "@/lib/fonts";

// Same destination as the hero CTA
const MVP_REQUEST_URL = "";

/* ------------------------------------------------------------------ */
/* Images: put these in public/images/                                 */
/* ------------------------------------------------------------------ */
const IMAGES = {
  building: "/images/sampletwo.jpg", // the office building photo (1376 x 768)
  rooftop: "/images/power.jpg", // solar panels
  workspace: "/images/cctv.jpg", // office floor
  entrance: "/images/access.jpg", // fingerprint reader
} as const;

// Size of the building photo
const IMG_W = 1376;
const IMG_H = 768;
// Where the roof starts, and where the road starts to take over, as a share of the photo height
const ROOF_Y = 0.07;
const BOTTOM_Y = 0.9;
// The part of the photo that must always be on screen on phones and tablets:
// from the left edge of the entrance canopy to the right edge of the tower,
// as a share of the photo width
const SPAN_L = 0.485;
const SPAN_R = 0.82;

// How far the camera pushes in when a zone opens
const ZOOM_DESKTOP = 2.6;
const ZOOM_MOBILE = 3;

type ZoneId = "rooftop" | "workspace" | "entrance";

/* ------------------------------------------------------------------ */
/* Content. Wording and product names follow the playbook (Section D). */
/* `rect` is the tappable zone on the building photo, as a percentage  */
/* of the photo: x, y, width, height. Nudge these to fit the photo.    */
/* ------------------------------------------------------------------ */
const ZONES: {
  id: ZoneId;
  num: string;
  label: string;
  area: string;
  blurb: string;
  items: string[];
  rect: { x: number; y: number; w: number; h: number };
}[] = [
  {
    id: "rooftop",
    num: "01",
    label: "Rooftop",
    area: "Power and energy",
    blurb:
      "The backup power, solar, batteries, and electrical protection that keep a business running when the mains fails or costs rise.",
    items: [
      "UPS (uninterruptible power supply)",
      "Generators and automatic transfer switches",
      "Solar PV and hybrid systems",
      "Batteries and energy storage",
      "Distribution boards, surge protection, and earthing",
      "Metering and energy monitoring",
      "Energy audits and efficiency",
    ],
    rect: { x: 60.5, y: 7, w: 21.5, h: 10 },
  },
  {
    id: "workspace",
    num: "02",
    label: "Workspace",
    area: "ICT and digital",
    blurb:
      "The networks, Wi-Fi, cabling, servers, telephony, business systems, and digital tools that keep a business connected.",
    items: [
      "Structured cabling",
      "Networking equipment",
      "Wi-Fi systems",
      "Internet connectivity and backup",
      "Servers, storage, and backup",
      "Business telephony",
      "Point-of-sale and hospitality systems",
      "End-user devices",
      "Digital presence and platforms",
    ],
    rect: { x: 61, y: 18.5, w: 21, h: 41 },
  },
  {
    id: "entrance",
    num: "03",
    label: "Entrance",
    area: "Facility technology",
    blurb:
      "The cameras, access control, fire detection, alarms, and building controls that watch over and protect a property.",
    items: [
      "CCTV",
      "Access control",
      "Fire detection and alarm",
      "Intruder alarms",
      "Intercoms and video door phones",
      "Public address and voice evacuation",
      "Building controls and system integration",
      "Gates, boom barriers, and parking systems",
    ],
    rect: { x: 48.5, y: 61, w: 22, h: 23 },
  },
];

const CSS = `
@keyframes wz-ping {
  0%   { transform: scale(1);   opacity: .8; }
  100% { transform: scale(2.3); opacity: 0; }
}
.wz-ping { animation: wz-ping 2s ease-out infinite; }
@keyframes wz-cat-in {
  from { opacity: 0; transform: translateY(16px) scale(.98); }
  to   { opacity: 1; transform: none; }
}
.wz-cat-in { animation: wz-cat-in .7s cubic-bezier(.16,1,.3,1) both; }
@keyframes wz-whoosh {
  0%   { opacity: 0; }
  40%  { opacity: .85; }
  100% { opacity: 0; }
}
.wz-whoosh { animation: wz-whoosh 1s ease-in-out both; }
@media (prefers-reduced-motion: reduce) {
  .wz-ping, .wz-cat-in, .wz-whoosh { animation: none; }
  .wz-ping { opacity: 0; }
}
`;

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black";
const ringOnPhoto =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/* ------------------------------------------------------------------ */
/* Where the building photo sits, so the markers always land on it     */
/* ------------------------------------------------------------------ */
type Box = { left: number; top: number; w: number; h: number };
type Layout = { desktop: boolean; reserve: number; minH: number; box: Box };

function computeLayout(W: number, H: number, reserve: number): Layout {
  if (W >= 1024) {
    // Desktop: the photo covers the whole section, leaning towards the top
    const s = Math.max(W / IMG_W, H / IMG_H);
    const w = IMG_W * s;
    const h = IMG_H * s;
    return {
      desktop: true,
      reserve,
      minH: 0,
      box: { left: (W - w) / 2, top: (H - h) * 0.25, w, h },
    };
  }

  // Phones and tablets. The photo is sized from the SCREEN WIDTH so the whole
  // tower and entrance always fit across, then the section is made tall
  // enough to hold it. (The old version sized it from the section height,
  // which on a phone was only as tall as the heading, so most of the building
  // was cut off.)
  const gap = 12;
  const span = Math.min(W * 0.9, 520);
  const w = span / (SPAN_R - SPAN_L);
  const h = (w * IMG_H) / IMG_W;
  const left = W / 2 - ((SPAN_L + SPAN_R) / 2) * w;
  const top = reserve + gap - ROOF_Y * h;
  const minH = Math.ceil(top + BOTTOM_Y * h + 16);
  return { desktop: false, reserve, minH, box: { left, top, w, h } };
}

const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function CatalogueSection() {
  const [active, setActive] = useState<ZoneId | null>(null);
  const [hover, setHover] = useState<ZoneId | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [bgOrigin, setBgOrigin] = useState<{ x: number; y: number } | null>(null);
  const [openDelay, setOpenDelay] = useState(400);
  const [whooshKey, setWhooshKey] = useState(0);
  const [reduced, setReduced] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ZoneId | null>(null);
  activeRef.current = active;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Measure the section so the photo and markers line up on every screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      // Keep the building still while a zone is open
      if (activeRef.current) return;
      const heading = headingRef.current;
      if (!heading) return;
      const W = section.clientWidth;
      const H = section.clientHeight;
      const reserve = Math.round(
        heading.getBoundingClientRect().bottom -
          section.getBoundingClientRect().top +
          56
      );
      const next = computeLayout(W, H, reserve);
      setLayout((prev) => {
        if (
          prev &&
          prev.desktop === next.desktop &&
          prev.reserve === next.reserve &&
          prev.minH === next.minH &&
          Math.round(prev.box.left) === Math.round(next.box.left) &&
          Math.round(prev.box.top) === Math.round(next.box.top) &&
          Math.round(prev.box.w) === Math.round(next.box.w)
        ) {
          return prev;
        }
        return next;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    if (headingRef.current) ro.observe(headingRef.current);
    return () => ro.disconnect();
  }, []);

  // Escape goes back to the building
  useEffect(() => {
    if (!active) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const smooth: ScrollBehavior = reduced ? "auto" : "smooth";

  const select = (id: ZoneId) => {
    const zone = ZONES.find((z) => z.id === id)!;
    if (layout) {
      const b = layout.box;
      const o = {
        x: b.left + ((zone.rect.x + zone.rect.w / 2) / 100) * b.w,
        y: b.top + ((zone.rect.y + zone.rect.h / 2) / 100) * b.h,
      };
      setOrigin(o);
      if (active === null) setBgOrigin(o);
    }
    setOpenDelay(active === null ? 400 : 80);
    setWhooshKey((k) => k + 1);
    setActive(id);
    if (!isDesktop()) {
      requestAnimationFrame(() =>
        infoRef.current?.scrollIntoView({ behavior: smooth, block: "start" })
      );
    }
  };

  const close = () => {
    setWhooshKey((k) => k + 1);
    setActive(null);
    if (!isDesktop()) {
      sectionRef.current?.scrollIntoView({ behavior: smooth, block: "start" });
    }
  };

  const enter = (id: ZoneId) => (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") setHover(id);
  };
  const leave = () => setHover(null);

  const open = active !== null;
  const current = ZONES.find((z) => z.id === active) ?? null;
  const lit = open ? null : hover;
  const originStr = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  const bgOriginStr = bgOrigin ? `${bgOrigin.x}px ${bgOrigin.y}px` : "50% 50%";
  const zoom = layout?.desktop === false ? ZOOM_MOBILE : ZOOM_DESKTOP;

  /* ----------------------- Motion for the background ----------------------- */
  const buildingStyle: CSSProperties = reduced
    ? {}
    : {
        transformOrigin: bgOriginStr,
        transform: open ? `scale(${zoom})` : "scale(1)",
        filter: open ? "blur(12px) brightness(1.1)" : "blur(0px) brightness(1)",
        transition: open
          ? "transform 900ms cubic-bezier(.7,0,.84,0), filter 800ms ease-in"
          : "transform 1000ms cubic-bezier(.16,1,.3,1) 120ms, filter 700ms ease-out 120ms",
        willChange: "transform, filter",
      };

  const zoneStyle = (isActive: boolean): CSSProperties => {
    if (reduced) {
      return { opacity: isActive ? 1 : 0, transition: "opacity 300ms ease" };
    }
    return isActive
      ? {
          opacity: 1,
          transform: "scale(1)",
          filter: "blur(0px)",
          transition: `opacity 650ms ease-out ${openDelay}ms, transform 1100ms cubic-bezier(.16,1,.3,1) ${Math.max(0, openDelay - 50)}ms, filter 900ms ease-out ${Math.max(0, openDelay - 50)}ms`,
          willChange: "transform, filter, opacity",
        }
      : {
          opacity: 0,
          transform: "scale(1.25)",
          filter: "blur(12px)",
          transition: "opacity 500ms ease-in, transform 700ms ease-in, filter 600ms ease-in",
        };
  };

  const fadeMask =
    "linear-gradient(to bottom, transparent, black 7%, black 93%, transparent)";
  // On phones the photo starts below the heading, so its top edge fades in
  const photoTopFade = "linear-gradient(to bottom, transparent, black 14%)";

  const boxStyle: CSSProperties = layout
    ? {
        left: layout.box.left,
        top: layout.box.top,
        width: layout.box.w,
        height: layout.box.h,
      }
    : { inset: 0 };

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="catalogue-heading"
      style={{
        ...display.style,
        minHeight: layout && !layout.desktop ? layout.minH : undefined,
      }}
      className="relative isolate scroll-mt-24 overflow-hidden text-white"
    >
      <style>{CSS}</style>

      {/* ============================ Background ============================ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
      >
        {/* Building */}
        <div className="absolute inset-0" style={buildingStyle}>
          <div
            className="absolute"
            style={{
              ...boxStyle,
              ...(layout && !layout.desktop
                ? { maskImage: photoTopFade, WebkitMaskImage: photoTopFade }
                : null),
            }}
          >
            <Image
              src={IMAGES.building}
              alt=""
              fill
              sizes="(min-width: 1024px) 100vw, 1000px"
              quality={80}
              className="object-cover"
            />
          </div>
        </div>

        {/* The three zone photos */}
        {ZONES.map((z) => (
          <div key={z.id} className="absolute inset-0" style={zoneStyle(active === z.id)}>
            <Image
              src={IMAGES[z.id]}
              alt=""
              fill
              sizes="100vw"
              quality={75}
              className="object-cover"
            />
          </div>
        ))}

        {/* The whoosh */}
        {whooshKey > 0 && !reduced && (
          <div
            key={whooshKey}
            className="wz-whoosh absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${originStr}, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%)`,
            }}
          />
        )}

        {/* Light tint so the photography stays vibrant */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ============================ Building markers ============================ */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        <div
          inert={open}
          className="absolute transition-opacity duration-300"
          style={{
            ...boxStyle,
            opacity: layout && !open ? 1 : 0,
          }}
        >
          {ZONES.map((z) => {
            const isLit = lit === z.id;
            return (
              <button
                key={z.id}
                type="button"
                aria-label={`${z.label}: ${z.area}`}
                onClick={() => select(z.id)}
                onPointerEnter={enter(z.id)}
                onPointerLeave={leave}
                className={`pointer-events-auto absolute rounded-xl ${ringOnPhoto}`}
                style={{
                  left: `${z.rect.x}%`,
                  top: `${z.rect.y}%`,
                  width: `${z.rect.w}%`,
                  height: `${z.rect.h}%`,
                }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-xl border transition-all duration-300 ${
                    isLit ? "border-white bg-[#0A63FF]/40" : "border-transparent bg-transparent"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="wz-ping absolute inset-0 rounded-full border-2 border-white" />
                  <span
                    className="wz-ping absolute inset-0 rounded-full border-2 border-white"
                    style={{ animationDelay: "1s" }}
                  />
                  <span
                    style={mono.style}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,0.7)] transition-colors duration-300 sm:h-11 sm:w-11 ${
                      isLit ? "bg-[#0A63FF]" : "bg-black/80"
                    }`}
                  >
                    {z.num}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================ Content ================================ */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[96rem] flex-col px-6 pb-16 pt-28 sm:px-10 lg:min-h-[100svh] lg:justify-center lg:px-16 lg:pb-20">
        <div className="pointer-events-auto flex max-w-xl flex-col gap-8">
          {/* Heading */}
          <div
            ref={headingRef}
            className={`transition-opacity duration-500 ${
              open ? "lg:pointer-events-none lg:opacity-0" : ""
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-400 md:text-base">
              Catalogue
            </p>
            <h2
              id="catalogue-heading"
              className="mt-4 text-balance text-[clamp(2rem,6.5vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]"
            >
              Find what your <span className="text-blue-400">building needs.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
              Choose a zone on the building, or use the buttons below.
            </p>

            {/* The three buttons: same result as tapping the building */}
            <div className="mt-7 grid w-full grid-cols-3 gap-2 sm:gap-3">
              {ZONES.map((z) => {
                const isActive = active === z.id;
                const isHover = hover === z.id && !isActive;
                return (
                  <button
                    key={z.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => select(z.id)}
                    onPointerEnter={enter(z.id)}
                    onPointerLeave={leave}
                    className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 py-3 text-center text-white backdrop-blur-md transition-colors duration-300 sm:px-3 sm:py-3.5 ${ringOnPhoto} ${
                      isActive
                        ? "border-[#0A63FF] bg-[#0A63FF]"
                        : isHover
                          ? "border-white bg-white/20"
                          : "border-white/25 bg-black/35 hover:bg-white/15"
                    }`}
                  >
                    <span style={mono.style} className="text-xs font-medium text-blue-300">
                      <span className={isActive ? "text-white" : ""}>{z.num}</span>
                    </span>
                    <span className="text-balance text-[0.68rem] font-semibold leading-tight min-[400px]:text-[0.72rem] sm:text-sm">
                      {z.area}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel: lighter glass so the zone photo stays visible behind it */}
          <div
            ref={infoRef}
            className="scroll-mt-40 lg:pointer-events-none lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-6"
          >
            {current && (
              <div
                key={current.id}
                role="region"
                id="catalogue-panel"
                aria-labelledby="catalogue-panel-title"
                tabIndex={0}
                style={{ animationDelay: reduced ? "0ms" : `${openDelay + 100}ms` }}
                className={`wz-cat-in relative w-full max-w-4xl rounded-3xl border border-white/20 bg-black/[0.16] p-6 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-[6px] [text-shadow:0_1px_14px_rgba(0,0,0,0.7)] sm:p-10 lg:pointer-events-auto lg:max-h-[85vh] lg:overflow-y-auto ${ring}`}
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close panel"
                  className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-[#0A63FF] sm:right-6 sm:top-6 ${ring}`}
                >
                  <X size={18} />
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                  {current.num} · {current.label}
                </p>
                <h3
                  id="catalogue-panel-title"
                  className="mt-2 pr-12 text-2xl font-bold tracking-[-0.01em] text-white md:text-3xl"
                >
                  {current.area}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-white/95">{current.blurb}</p>

                <div className="mt-6 border-t border-white/20 pt-5">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                    Key offerings and scope
                  </h4>
                  <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
                    {current.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 border-b border-white/15 pb-3 text-sm leading-snug text-white"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                  <a
                    href={MVP_REQUEST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 rounded-full bg-[#0A63FF] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-blue-600 ${ring}`}
                  >
                    Start a request
                    <ArrowRight size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={close}
                    className={`flex items-center justify-center rounded-full border border-white/30 bg-black/20 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/20 ${ring}`}
                  >
                    Back to building
                  </button>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-white/80">
                  Specialist partners supply, install and service. Wisscano
                  coordinates and remains accountable to you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}