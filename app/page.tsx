import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import HomePage from "./contact/page";
import HeroSection from "./hero/page";
import AboutSection from "./about/page";
import Header from "@/components/header/page";
import CatalogueSection from "@/components/CatalogueSection";
import ProcessSection from "./process/page";

export const metadata: Metadata = {
  title: "Contact Coordination Desk | Wisscano Technologies",
  description:
    "Direct requirement triage for ICT, power, and physical security installations across Kitengela, Athi River, and Nairobi.",
};

// Slow vertical drift on the pinned background (desktop only).
// Switched off on phones and for visitors who prefer reduced motion.
const BG_CSS = `
@keyframes wz-bg-drift {
  from { transform: translate3d(0, -1.5%, 0) scale(1.03); }
  to   { transform: translate3d(0, 1.5%, 0) scale(1.03); }
}
.wz-bg-drift { animation: wz-bg-drift 45s ease-in-out infinite alternate; }
@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .wz-bg-drift { animation: none; }
}
`;

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-[#090D16]">
      <style>{BG_CSS}</style>

      {/* ----------------------------------------------------------- */}
      {/* PINNED BACKGROUND                                           */}
      {/* Stays fixed behind the whole page while sections scroll     */}
      {/* over it. The solid #090D16 shows if the image is slow or    */}
      {/* fails to load.                                              */}
      {/* ----------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#090D16]"
      >
        <div className="wz-bg-drift absolute -inset-[4%]">
          <Image
            src="/images/mainbgtwo.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={80}
            className="object-cover object-center opacity-90"
          />
        </div>

        {/* Navy tint: keeps text readable and pulls the blue toward the brand */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00070D]/60 via-[#090D16]/50 to-[#00070D]/80" />
      </div>

      {/* ----------------------------------------------------------- */}
      {/* PAGE CONTENT                                                */}
      {/* Sections must stay transparent so the background shows      */}
      {/* ----------------------------------------------------------- */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <AboutSection />
        <CatalogueSection />
        <ProcessSection />
        <HomePage />
      </div>
    </main>
  );
}