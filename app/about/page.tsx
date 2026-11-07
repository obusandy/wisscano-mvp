"use client";

import { ArrowDown } from "lucide-react";
import { display, mono } from "@/lib/fonts";

const FOCUS = ["Hospitality", "Commercial", "Industrial"] as const;

/* ------------------------------------------------------------------ */
/* The loop: three sectors on a ring, with an arrow running from each  */
/* to the next. Numbering matches the catalogue markers.               */
/* ------------------------------------------------------------------ */
const CX = 240; // centre of the ring
const CY = 256.7;
const RING = 155.9; // radius of the ring the three circles sit on
const NODE_R = 64; // radius of each circle

const SECTORS = [
  { num: "01", name: ["Power and", "energy"], deg: -90 }, // top
  { num: "02", name: ["ICT and", "digital"], deg: 30 }, // bottom right
  { num: "03", name: ["Facility", "technology"], deg: 150 }, // bottom left
] as const;

const rad = (d: number) => (d * Math.PI) / 180;
const point = (deg: number) =>
  [CX + RING * Math.cos(rad(deg)), CY + RING * Math.sin(rad(deg))] as const;
const f = (n: number) => n.toFixed(1);

const NODES = SECTORS.map((s) => {
  const [x, y] = point(s.deg);
  return { ...s, x, y };
});

// Each arrow leaves one circle and stops just short of the next
const ARROWS = SECTORS.map((s) => {
  const [x0, y0] = point(s.deg + 27);
  const [x1, y1] = point(s.deg + 120 - 31);
  return `M${f(x0)} ${f(y0)} A${RING} ${RING} 0 0 1 ${f(x1)} ${f(y1)}`;
});

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={display.style}
      className="relative flex min-h-[100svh] px-0 py-0 sm:px-3 sm:py-3"
    >
      <div className="relative flex w-full flex-1 overflow-hidden  bg-[#00070D]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:rounded-[2.25rem]">
        {/* A soft blue glow from the top edge, echoing the hero so the two read as one */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_18%_0%,rgba(10,99,255,0.28),transparent_70%)]"
        />

        <div className="relative mx-auto grid w-full max-w-7xl content-center items-center gap-8 px-6 pb-10 pt-24 sm:px-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12 lg:px-16 lg:pb-10 lg:pt-24">
          {/* ------------------------------- Copy ------------------------------- */}
          <div className="[text-shadow:0_1px_18px_rgba(0,7,13,0.55)]">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4D9BFF] md:text-base">
              About Wisscano
            </p>

            <h2
              id="about-heading"
              className="mt-4 text-balance text-[clamp(2rem,5.5vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white"
            >
              Three systems.{" "}
              <span className="text-[#4D9BFF]">One accountable contact.</span>
            </h2>

            <div className="mt-5 max-w-xl space-y-4 text-[0.95rem] leading-relaxed text-white/80 md:text-base lg:text-[1.05rem]">
              <p>
                Most businesses run several technical systems, and each arrives with
                its own vendor, quote and warranty. When something fails where two
                systems meet, each vendor points at the other.
              </p>
              <p className="text-white">
                Wisscano Technologies is a technology procurement and solutions
                company based in Kitengela, Kenya. We coordinate specialist partners
                across ICT and digital, power and energy, and facility technology,
                and we stay accountable from sourcing to handover.
              </p>
            </div>

            <p className="mt-5 max-w-xl border-l-2 border-[#0A63FF] pl-4 text-[0.95rem] font-medium text-white md:text-base lg:text-[1.05rem]">
Streamline your operations with one accountable contact coordinating your ICT, power, and facility technology partners,replacing multiple vendor relationships with just one.            </p>

            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                Our focus
              </span>
              {FOCUS.map((item, i) => (
                <span key={item} className="flex items-center gap-3">
                  {i > 0 && (
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#4D9BFF]" />
                  )}
                  <span className="font-medium text-white">{item}</span>
                </span>
              ))}
            </p>

            <a
              href="#process"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#4D9BFF] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D9BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#00070D]"
            >
              How we work
              <ArrowDown size={15} />
            </a>
          </div>

          {/* ------------------------------ The loop ------------------------------ */}
          <svg
            viewBox="0 0 480 440"
            role="img"
            aria-label="Power and energy, ICT and digital, and facility technology, joined in a loop by arrows"
            className="mx-auto h-auto w-full max-w-md select-none overflow-visible md:max-w-lg"
          >
            <defs>
              <marker
                id="about-arrow"
                viewBox="0 0 12 12"
                refX="9"
                refY="6"
                markerUnits="userSpaceOnUse"
                markerWidth="14"
                markerHeight="14"
                orient="auto"
              >
                <path
                  d="M2 2 L9.5 6 L2 10"
                  fill="none"
                  stroke="#4D9BFF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
            </defs>

            {/* The arrows that make the loop */}
            {ARROWS.map((d) => (
              <path
                key={d}
                d={d}
                fill="none"
                stroke="#4D9BFF"
                strokeWidth={1.75}
                strokeLinecap="round"
                markerEnd="url(#about-arrow)"
              />
            ))}

            {/* The three sectors */}
            {NODES.map((n) => (
              <g key={n.num} className="group">
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R}
                  className="transition-[fill] duration-300 [fill:rgba(10,99,255,0.16)] [stroke:rgba(255,255,255,0.42)] [stroke-width:1.25] group-hover:[fill:rgba(10,99,255,0.34)]"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R - 7}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={1}
                />
                <text
                  x={n.x}
                  y={n.y - 17}
                  textAnchor="middle"
                  fill="#4D9BFF"
                  fontSize={11}
                  fontWeight={500}
                  style={mono.style}
                  aria-hidden="true"
                >
                  {n.num}
                </text>
                {n.name.map((line, i) => (
                  <text
                    key={line}
                    x={n.x}
                    y={n.y + 3 + i * 16}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={13.5}
                    fontWeight={600}
                    aria-hidden="true"
                  >
                    {line}
                  </text>
                ))}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}