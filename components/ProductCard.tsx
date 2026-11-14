"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  item: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    image?: string;
    price?: number;
    currency: string;
  };
};

export default function ProductCard({ item }: Props) {
  const { addItem } = useCart();
  const [broken, setBroken] = useState(false);
  const showImage = !!item.image && !broken;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#0A63FF]/40 hover:shadow-[0_20px_50px_-20px_rgba(10,99,255,0.35)]">
      {/* Image box: same size for every card so the grid lines up */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-gray-50 to-gray-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="absolute inset-0 h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-[#0A63FF]/20">
              {(item.brand ?? item.name).charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        
      </div>

      {/* Text and price: footer is pinned to the bottom */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug text-gray-900">
          {item.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-sm font-bold text-gray-900">
            {item.price
              ? `${item.currency} ${item.price.toLocaleString()}`
              : "Request quote"}
          </span>
          <button
            type="button"
            onClick={() =>
              addItem({
                id: item._id,
                name: item.name,
                price: item.price ?? 0,
                quantity: 1,
              })
            }
            className="rounded-full bg-[#0A63FF] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A63FF] focus-visible:ring-offset-2"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}