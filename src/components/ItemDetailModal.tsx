'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, MenuCategory } from '@/lib/types';
import { X, Sparkles, ShieldCheck } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: () => void;
}

export default function ItemDetailModal({
  item,
  categories,
  onClose,
}: ItemDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset image error state when item changes
    setImageError(false);

    // Prevent body scroll when modal is open
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [item]);

  if (!item) return null;

  const category = categories.find((c) => c.id === item.categoryId);
  const displayImage = imageError || !item.image
    ? '/images/placeholder-food.svg'
    : item.image;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card (Bottom sheet on mobile, centered modal on desktop) */}
      <div className="relative w-full max-w-md bg-noon-card border border-noon-border/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 animate-slide-up max-h-[90vh] flex flex-col">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 flex items-center justify-center transition-all border border-white/20 active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Food Image */}
        <div className="relative w-full h-64 sm:h-72 bg-noon-cardElevated flex-shrink-0">
          <Image
            src={displayImage}
            alt={item.name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 450px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noon-card via-transparent to-black/30" />

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            {item.isNew ? (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-noon-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                NEW AT NOON
              </span>
            ) : <span />}

            <span className="inline-flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Halal
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1">
          {category && (
            <p className="text-xs uppercase font-extrabold tracking-widest text-noon-gold/90 mb-1">
              {category.name}
            </p>
          )}

          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {item.name}
            </h2>
            <span className="text-2xl font-black text-noon-gold whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>

          {/* Description only if supplied by admin */}
          {item.description && item.description.trim().length > 0 && (
            <div className="mt-4 pt-4 border-t border-noon-border/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                About this item
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          )}

          {/* Display-only reminder */}
          <div className="mt-6 pt-4 border-t border-noon-border/40 text-center">
            <p className="text-xs text-gray-400 italic">
              Please place your order directly with your server at Noon Cafe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
