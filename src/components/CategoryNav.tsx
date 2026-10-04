'use client';

import React, { useRef, useEffect } from 'react';
import { MenuCategory } from '@/lib/types';

interface CategoryNavProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto scroll active button into view inside the horizontal bar
  useEffect(() => {
    if (activeBtnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeBtnRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategoryId]);

  const activeCategories = categories.filter((c) => c.isActive !== false);

  return (
    <nav className="sticky top-[106px] z-20 bg-noon-dark/95 backdrop-blur-md border-b border-noon-border/50 py-2.5 px-3">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeCategories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeBtnRef : null}
              onClick={() => {
                onSelectCategory(cat.id);
                // Also scroll page section into view
                const el = document.getElementById(cat.id);
                if (el) {
                  const headerOffset = 160;
                  const elementPosition = el.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 snap-center select-none active:scale-95 ${
                isActive
                  ? 'bg-noon-gold text-noon-dark shadow-md shadow-noon-gold/20 font-extrabold ring-1 ring-noon-gold/50'
                  : 'bg-noon-card text-gray-300 hover:text-white hover:bg-noon-cardElevated border border-noon-border/80'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
