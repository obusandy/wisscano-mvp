import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { display } from "@/lib/fonts";

/* ------------------------------------------------------------------ */
/* Details. CHANGE THIS block if anything is wrong.                    */
/* ------------------------------------------------------------------ */
const COMPANY = "Wisscano Technologies";
const TAGLINE = "One Hub. Infinite Tech Solutions.";
const LOCATION = "Kitengela, Kenya"; // CHANGE THIS if there is a physical address later
const PHONE_DISPLAY = "+254 119 834 490";
const PHONE_LINK = "tel:+254119834490";
const EMAIL = "info@wisscano.co.ke"; // CHANGE THIS to the real company email

const WHATSAPP_URL =
  "https://wa.me/254119834490?text=Hello%20Wisscano%20Technologies%2C%20I%20would%20like%20to%20discuss%20a%20project.";
const FACEBOOK_URL = "https://www.facebook.com/"; // CHANGE THIS to the Facebook page
const INSTAGRAM_URL = "https://www.instagram.com/"; // CHANGE THIS to the Instagram page
const LINKEDIN_URL = "https://www.linkedin.com/"; // CHANGE THIS to the LinkedIn page

const SECTORS = [
  { label: "ICT & Digital", href: "/products?sector=ict-digital" },
  { label: "Power & Energy", href: "/products?sector=power-energy" },
  { label: "Facility Technology", href: "/products?sector=facility-tech" },
];

/* ------------------------------------------------------------------ */
/* Social icons: white glyph on a brand-coloured tile                  */
/* ------------------------------------------------------------------ */
const glyph = {
  fill: "none",
  stroke: "#fff",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SOCIALS: { name: string; href: string; tile: string; icon: ReactNode }[] = [
  {
    name: "Facebook",
    href: FACEBOOK_URL,
    tile: "bg-[#1877F2]",
    icon: (
      <path
        d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z"
        fill="#fff"
      />
    ),
  },
  {
    name: "Instagram",
    href: INSTAGRAM_URL,
    tile: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5]",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" {...glyph} />
        <circle cx="12" cy="12" r="3.6" {...glyph} />
        <circle cx="16.8" cy="7.2" r="1" fill="#fff" />
      </>
    ),
  },
  {
    name: "LinkedIn",
    href: LINKEDIN_URL,
    tile: "bg-[#0A66C2]",
    icon: (
      <>
        <circle cx="6.5" cy="6.5" r="1.6" fill="#fff" />
        <rect x="5" y="9" width="3" height="10" fill="#fff" />
        <path
          d="M10 9h2.9v1.4c.5-.9 1.6-1.6 3.1-1.6 3 0 3.5 2 3.5 4.5V19h-3v-5c0-1.2 0-2.5-1.6-2.5S13 12.8 13 14v5h-3z"
          fill="#fff"
        />
      </>
    ),
  },
  {
    name: "WhatsApp",
    href: WHATSAPP_URL,
    tile: "bg-[#25D366]",
    icon: (
      <>
        <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z" {...glyph} />
        <path
          d="M9.2 8.6c0 3.3 2.9 6.2 6.2 6.2l1-1.4-1.9-.9-.8.8c-.9-.4-1.9-1.3-2.3-2.3l.8-.8-.9-1.9-1.1.3z"
          fill="#fff"
        />
      </>
    ),
  },
];

const linkClass =
  "rounded text-sm text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D9BFF]";

const heading = "text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/70";

export default function Footer() {
  return (
    <footer
      style={display.style}
      className="relative border-t border-white/20 bg-gradient-to-t from-black/55 via-black/30 to-transparent text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]"
    >
      <div className="mx-auto max-w-7xl px-6 pb-5 pt-8 sm:px-8">
        <div className="grid gap-7 sm:grid-cols-3">
          {/* ---------- Brand ---------- */}
          <div>
            <p className="text-lg font-bold tracking-tight">
              {COMPANY}
              <span className="text-[#4D9BFF]">.</span>
            </p>
            <p className="mt-1 text-sm font-medium text-[#6FB0FF]">{TAGLINE}</p>

            <ul className="mt-4 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${COMPANY} on ${s.name}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${s.tile}`}
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Sectors ---------- */}
          <nav aria-label="Footer sectors">
            <h2 className={heading}>Sectors</h2>
            <ul className="mt-3 space-y-2">
              {SECTORS.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className={linkClass}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- Contact ---------- */}
          <div>
            <h2 className={heading}>Get in touch</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2.5">
                <MapPin size={15} className="shrink-0 text-[#6FB0FF]" />
                <span>Based in {LOCATION}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-[#6FB0FF]" />
                <a href={PHONE_LINK} className={linkClass}>
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-[#6FB0FF]" />
                <a href={`mailto:${EMAIL}`} className={`${linkClass} break-all`}>
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------- Bottom line ---------- */}
        <p className="mt-6 border-t border-white/20 pt-4 text-center  text-sm text-white/75 sm:text-center">
          &copy; {new Date().getFullYear()} {COMPANY}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}