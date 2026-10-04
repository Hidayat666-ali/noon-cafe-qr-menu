'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ItemCard from '@/components/ItemCard';
import ItemDetailModal from '@/components/ItemDetailModal';
import NewAtNoon from '@/components/NewAtNoon';
import OffersBanner from '@/components/OffersBanner';
import QrModal from '@/components/QrModal';
import { useMenu } from '@/lib/menu-context';
import { MenuItem } from '@/lib/types';
import { Search, UtensilsCrossed, Sparkles, ArrowUp } from 'lucide-react';

export default function NoonMenuPage() {
  const {
    data,
    isLoading,
    activeCategory,
    setActiveCategory,
    selectedItem,
    setSelectedItem,
  } = useMenu();

  const [searchQuery, setSearchQuery] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isClickingCategoryRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { settings, categories, items, offers } = data;

  // Active categories in order
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  // Group items by category (or filtered by search query)
  const itemsByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: Record<string, MenuItem[]> = {};

    activeCategories.forEach((cat) => {
      const catItems = items
        .filter((item) => {
          if (item.isAvailable === false) return false;
          if (item.categoryId !== cat.id) return false;
          if (q) {
            return (
              item.name.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q))
            );
          }
          return true;
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      result[cat.id] = catItems;
    });

    return result;
  }, [activeCategories, items, searchQuery]);

  // ScrollSpy to sync active category during scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      if (isClickingCategoryRef.current || searchQuery) return;

      const headerOffset = 220;
      let currentActive = activeCategories[0]?.id || activeCategory;

      for (const cat of activeCategories) {
        const el = document.getElementById(cat.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            currentActive = cat.id;
          }
        }
      }

      if (currentActive !== activeCategory) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategories, activeCategory, searchQuery, setActiveCategory]);

  const handleSelectCategory = (catId: string) => {
    isClickingCategoryRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    setActiveCategory(catId);

    const el = document.getElementById(catId);
    if (el) {
      const headerOffset = 160;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    clickTimeoutRef.current = setTimeout(() => {
      isClickingCategoryRef.current = false;
    }, 800);
  };

  return (
    <div className="min-h-screen bg-noon-dark text-gray-100 flex flex-col max-w-lg mx-auto shadow-2xl relative border-x border-noon-border/30">
      {/* 1. Header with branding, location & Halal emblem */}
      <Header onOpenQr={() => setIsQrOpen(true)} />

      {/* 2. Welcome Hero */}
      <section className="px-4 pt-4 pb-2">
        <div className="bg-gradient-to-br from-noon-card via-noon-cardElevated to-noon-dark p-4 rounded-3xl border border-noon-border/60 shadow-lg relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-noon-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-noon-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to Noon Cafe</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {settings.welcomeSubtext || "What's your craving?"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Freshly prepared food, signature coolers & hot sips
            </p>

            {/* Quick Search Bar */}
            <div className="mt-3.5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fries, chai, coolers..."
                className="w-full bg-noon-dark/90 border border-noon-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-noon-gold focus:ring-1 focus:ring-noon-gold transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Navigation Chips */}
      {!searchQuery && (
        <CategoryNav
          categories={activeCategories}
          activeCategoryId={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* 4. NEW AT NOON (completely controlled by admin, hidden when empty) */}
      {!searchQuery && (
        <NewAtNoon items={items} onSelectItem={setSelectedItem} />
      )}

      {/* 5. OFFERS (completely controlled by admin, hidden when empty) */}
      {!searchQuery && <OffersBanner offers={offers} />}

      {/* 6. Main Menu Items by Category */}
      <main className="flex-1 px-4 py-3 flex flex-col gap-6">
        {activeCategories.map((category) => {
          const categoryItems = itemsByCategory[category.id] || [];

          if (categoryItems.length === 0) {
            // If searching and no results in this category, don't show header
            if (searchQuery) return null;
          }

          return (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-36"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3 border-b border-noon-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-noon-gold" />
                  <h3 className="font-extrabold text-base tracking-wider uppercase text-white">
                    {category.name}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 bg-noon-card px-2 py-0.5 rounded-full border border-noon-border/40">
                  {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              {categoryItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {categoryItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onSelect={setSelectedItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-noon-card/40 rounded-xl border border-noon-border/30 text-center">
                  <p className="text-xs text-gray-500">No items available in this category</p>
                </div>
              )}
            </section>
          );
        })}

        {/* Empty Search State */}
        {searchQuery && Object.values(itemsByCategory).every((arr) => arr.length === 0) && (
          <div className="py-12 px-4 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-noon-card flex items-center justify-center text-gray-500 mb-3 border border-noon-border">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">No items found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              No matching items for &ldquo;{searchQuery}&rdquo;. Try another craving!
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-noon-card border border-noon-gold/50 text-noon-gold text-xs font-bold"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 bg-noon-card/80 border-t border-noon-border/60 px-4 py-8 text-center text-xs text-gray-400">
        <div className="w-10 h-10 rounded-2xl bg-noon-cardElevated border border-noon-gold/30 mx-auto flex items-center justify-center mb-2">
          <span className="font-arabic font-bold text-xl text-noon-gold leading-none">ن</span>
        </div>
        <p className="font-extrabold text-sm text-white tracking-wider">
          NOON CAFE
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          {settings.address}
        </p>
        <p className="text-[11px] text-noon-300">
          {settings.area}, {settings.city}
        </p>

        <div className="mt-4 pt-4 border-t border-noon-border/40 flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>Digital Menu</span>
          <span>•</span>
          <span>100% Halal</span>
          <span>•</span>
          <button
            onClick={() => setIsQrOpen(true)}
            className="text-noon-gold hover:underline font-semibold"
          >
            Show QR
          </button>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-noon-gold text-noon-dark shadow-xl shadow-noon-gold/30 flex items-center justify-center font-bold transition-all duration-300 animate-fade-in hover:scale-110 active:scale-95 border border-amber-300"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        categories={categories}
        onClose={() => setSelectedItem(null)}
      />

      {/* QR Code Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        settings={settings}
      />
    </div>
  );
}
