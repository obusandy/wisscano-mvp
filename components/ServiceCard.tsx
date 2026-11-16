"use client";

import { useState } from "react";

type Props = {
  item: {
    name: string;
    description: string;
    image?: string;
  };
  number: number;
};

export default function ServiceCard({ item, number }: Props) {
  const [broken, setBroken] = useState(false);
  const showImage = !!item.image && !broken;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#0A63FF]/40 hover:shadow-[0_20px_50px_-20px_rgba(10,99,255,0.35)]">
      {/* Image box: matching ProductCard dimensions and styling */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-gray-50 to-gray-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-[#0A63FF]/20">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

       
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
          {item.description}
        </p>
        <a
          href="/#contact"
          className="mt-6 text-sm font-semibold text-[#0A63FF] transition hover:underline"
        >
          Enquire about this service ↗
        </a>
      </div>
    </div>
  );
}