'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface ItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export default function ItemCard({ item, onSelect }: ItemCardProps) {
  const [imageError, setImageError] = useState(false);

  // Fallback high quality placeholder if image path fails
  const displayImage = imageError || !item.image
    ? '/images/placeholder-food.svg'
    : item.image;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative bg-noon-card/90 hover:bg-noon-cardElevated/95 border border-noon-border/60 hover:border-noon-gold/40 rounded-2xl p-3 flex gap-3.5 items-center transition-all duration-200 cursor-pointer shadow-md shadow-black/20 active:scale-[0.98] select-none"
    >
      {/* Food Image Container */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-noon-cardElevated border border-noon-border/40 shadow-inner">
        <Image
          src={displayImage}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100px, 120px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Gradient shadow for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* "NEW" badge if flagged by admin */}
        {item.isNew && (
          <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-noon-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span>NEW</span>
          </div>
        )}
      </div>

      {/* Item Information */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-white text-base sm:text-lg leading-snug tracking-tight group-hover:text-noon-gold transition-colors line-clamp-2">
              {item.name}
            </h3>
          </div>

          {/* Description only if supplied by admin */}
          {item.description && item.description.trim().length > 0 && (
            <p className="mt-1 text-xs text-gray-400 line-clamp-2 font-normal leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Price and Details footer */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-noon-gold font-bold text-base sm:text-lg leading-none">
              ₹{item.price}
            </span>
          </div>

          <div className="text-[11px] font-semibold text-gray-400 group-hover:text-noon-gold/90 transition-colors flex items-center gap-1">
            <span>View</span>
            <span className="text-xs">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
