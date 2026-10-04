'use client';

import React from 'react';
import Image from 'next/image';
import { MenuItem } from '@/lib/types';
import { Sparkles, Flame } from 'lucide-react';

interface NewAtNoonProps {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export default function NewAtNoon({ items, onSelectItem }: NewAtNoonProps) {
  // Only items where isNew === true and isAvailable !== false
  const newItems = items.filter((item) => item.isNew && item.isAvailable !== false);

  // If nothing is marked as new, don't display the section!
  if (newItems.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-noon-600 flex items-center justify-center text-white shadow-md shadow-noon-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-white uppercase flex items-center gap-1.5">
              <span>NEW AT NOON</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">Fresh arrivals crafted for you</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-noon-gold/90 bg-noon-gold/10 px-2 py-0.5 rounded-full border border-noon-gold/20">
          {newItems.length} {newItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Horizontal Carousel of New Items */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
        {newItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="flex-shrink-0 w-44 bg-noon-card border border-noon-gold/30 hover:border-noon-gold rounded-2xl overflow-hidden cursor-pointer snap-start transition-all shadow-lg active:scale-95 group"
          >
            {/* Image */}
            <div className="relative w-full h-28 bg-noon-cardElevated">
              <Image
                src={item.image || '/images/placeholder-food.svg'}
                alt={item.name}
                fill
                sizes="180px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noon-card via-transparent to-transparent" />
              <div className="absolute top-2 left-2 bg-noon-gold text-noon-dark text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                NEW
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-noon-gold transition-colors">
                {item.name}
              </h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-noon-gold font-extrabold text-sm">
                  ₹{item.price}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold group-hover:text-white">
                  View →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
