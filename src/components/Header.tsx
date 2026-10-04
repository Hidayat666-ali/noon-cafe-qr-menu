'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, QrCode, ShieldCheck, MapPin, Settings } from 'lucide-react';
import { useMenu } from '@/lib/menu-context';

interface HeaderProps {
  onOpenQr: () => void;
}

export default function Header({ onOpenQr }: HeaderProps) {
  const { data } = useMenu();
  const { settings } = data;

  return (
    <header className="sticky top-0 z-30 bg-noon-dark/95 backdrop-blur-md border-b border-noon-border/60 transition-all">
      {/* Top micro bar for location and Halal badge */}
      <div className="bg-noon-card/80 px-4 py-1.5 flex items-center justify-between text-xs text-gray-300 border-b border-noon-border/40">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-noon-gold flex-shrink-0" />
          <span className="truncate font-medium">{settings.area || 'Kismatpur'}, {settings.city || 'Hyderabad'}</span>
        </div>

        <div className="flex items-center gap-3">
          {settings.halalCertified && (
            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full font-semibold text-[10px] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% HALAL</span>
            </div>
          )}

          <Link
            href="/admin"
            title="Staff Admin Portal"
            className="text-gray-400 hover:text-noon-gold transition-colors p-0.5"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/menu/noon" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-noon-cardElevated to-noon-dark border border-noon-gold/30 p-1 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-noon-gold/60 transition-colors">
            {/* Arabic 'ن' seal */}
            <div className="w-full h-full rounded-xl bg-noon-card flex flex-col items-center justify-center border border-noon-border/50">
              <span className="font-arabic font-bold text-2xl text-noon-gold leading-none -mt-1 select-none">ن</span>
              <span className="text-[7px] text-gray-400 tracking-tighter uppercase font-semibold">NOON</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                <span>NOON</span>
                <span className="text-noon-gold font-bold">CAFE</span>
              </h1>
            </div>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">
              {settings.tagline || 'Cafe & Eatery'} • <span className="text-noon-300">Kismatpur</span>
            </p>
          </div>
        </Link>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {settings.instagramUrl && (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="w-9 h-9 rounded-xl bg-noon-card border border-noon-border text-gray-300 hover:text-pink-400 hover:border-pink-500/30 flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={onOpenQr}
            aria-label="View QR Code"
            className="w-9 h-9 rounded-xl bg-noon-card border border-noon-border text-noon-gold hover:border-noon-gold/50 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
