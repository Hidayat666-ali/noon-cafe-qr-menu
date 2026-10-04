'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { CafeSettings } from '@/lib/types';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CafeSettings;
}

export default function QrModal({ isOpen, onClose, settings }: QrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [menuUrl, setMenuUrl] = useState('/menu/noon');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/menu/noon`;
      setMenuUrl(fullUrl);

      if (isOpen && canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          fullUrl,
          {
            width: 260,
            margin: 2,
            color: {
              dark: '#141416',
              light: '#FFFFFF',
            },
          },
          (error) => {
            if (error) console.error('Error generating QR:', error);
          }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `noon-cafe-kismatpur-qr.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-noon-card border border-noon-gold/40 rounded-3xl p-6 text-center shadow-2xl z-10 animate-fade-in flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cafe Logo Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-noon-cardElevated to-noon-dark border-2 border-noon-gold p-1 flex items-center justify-center shadow-lg mb-3">
          <div className="w-full h-full rounded-xl bg-noon-card flex flex-col items-center justify-center">
            <span className="font-arabic font-bold text-2xl text-noon-gold leading-none -mt-0.5">ن</span>
          </div>
        </div>

        <h3 className="font-black text-xl text-white tracking-wide">
          NOON CAFE
        </h3>
        <p className="text-xs text-noon-300 font-medium">
          {settings.area || 'Kismatpur'}, {settings.city || 'Hyderabad'}
        </p>

        {/* QR Code Container */}
        <div className="mt-4 p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-noon-gold/30">
          <canvas ref={canvasRef} className="rounded-lg max-w-full" />
        </div>

        <p className="text-xs text-gray-400 mt-3 font-medium">
          Scan to view the live digital menu
        </p>
        <p className="text-[11px] text-noon-gold/80 font-mono mt-0.5 break-all px-2">
          {menuUrl}
        </p>

        {/* Action Buttons */}
        <div className="mt-5 w-full flex flex-col gap-2.5">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-4 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-noon-gold/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download QR Image</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-xl bg-noon-cardElevated border border-noon-border text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Menu Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
