'use client';

import React from 'react';
import Image from 'next/image';
import { Offer } from '@/lib/types';
import { Tag, Calendar, Sparkles } from 'lucide-react';

interface OffersBannerProps {
  offers: Offer[];
}

export default function OffersBanner({ offers }: OffersBannerProps) {
  const activeOffers = offers.filter((o) => o.isActive);

  // If there are no active offers, don't display the section!
  if (activeOffers.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Tag className="w-4 h-4 text-noon-gold" />
        <h2 className="text-xs font-extrabold tracking-widest uppercase text-noon-gold">
          SPECIAL OFFERS
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {activeOffers.map((offer) => (
          <div
            key={offer.id}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-noon-cardElevated via-noon-card to-noon-dark border border-noon-gold/40 p-4 shadow-xl"
          >
            {/* Background decorative glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-noon-gold/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex gap-3.5 items-center">
              {offer.image && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-noon-border bg-black/40">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Limited Time
                  </span>
                  {offer.validityText && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {offer.validityText}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                  {offer.title}
                </h3>

                {offer.description && (
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    {offer.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
