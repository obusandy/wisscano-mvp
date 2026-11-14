"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { display } from "@/lib/fonts";

const FOCUS = ["Hospitality", "Commercial", "Industrial"] as const;

/* ------------------------------------------------------------------ */
/* Partner logos. Put the files in public/images/partners/             */
/* ------------------------------------------------------------------ */
const PARTNERS = [
  { name: "Microsoft", file: "microsoft.png" },
  { name: "Adobe", file: "adobe.png" },
  { name: "Google Cloud", file: "googlecloud.png" },
  { name: "Acronis", file: "acronis.png" },
  { name: "Bitdefender", file: "bitfender.png" },
  { name: "Kaspersky", file: "kaspersky.png" },
  { name: "Malwarebytes", file: "malwarebyte.png" },
] as const;

// Which partners go in each row (by position in the list above)
const ROWS: number[][] = [
  [0, 1],
  [2, 3, 4],
  [5, 6],
];

const CSS = `
@keyframes wz-float {
  from { transform: translateY(0); }
  to   { transform: translateY(-10px); }
}
.wz-float { animation: wz-float 5s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .wz-float { animation: none; }
}
`;

/* ------------------------------------------------------------------ */
/* One floating logo tile                                              */
/* ------------------------------------------------------------------ */
function PartnerTile({
  partner,
  index,
}: {
  partner: (typeof PARTNERS)[number];
  index: number;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <li
      className="wz-float"
      style={{
        animationDuration: `${4.6 + (index % 3) * 0.7}s`,
        animationDelay: `${index * -0.8}s`,
      }}
    >
      <div className="relative flex h-20 w-28 items-center justify-center rounded-2xl border border-white/30 bg-white/95 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-36">
        {broken ? (
          <span className="px-2 text-center text-sm font-semibold text-slate-700">
            {partner.name}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/${partner.file}`}
            alt={partner.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-contain p-4 sm:p-5"
          />
        )}
      </div>
    </li>
  );
}

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={display.style}
      className="relative flex min-h-[100svh] px-0 py-0 sm:px-3 sm:py-3"
    >
      <style>{CSS}</style>

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
              Streamline your operations with one accountable contact coordinating
              your ICT, power, and facility technology partners, replacing multiple
              vendor relationships with just one.
            </p>

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

          {/* --------------------------- Partner logos --------------------------- */}
          <div className="mx-auto w-full max-w-md md:max-w-lg">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
              Partner brands
            </p>

            <div className="flex flex-col items-center gap-4 sm:gap-5" role="list" aria-label="Partner brands">
              {ROWS.map((row, r) => (
                <ul
                  key={r}
                  role="presentation"
                  className="flex items-center justify-center gap-3 sm:gap-4"
                >
                  {row.map((i) => (
                    <PartnerTile key={PARTNERS[i].name} partner={PARTNERS[i]} index={i} />
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}