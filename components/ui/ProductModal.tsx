'use client';

import { useEffect, useState } from 'react';
import { Deal } from '@/types';
import { calculateDiscount, formatPrice, getRemainingTime } from '@/lib/csvParser';

interface ProductModalProps {
  deal: Deal;
  onClose: () => void;
}

export default function ProductModal({ deal, onClose }: ProductModalProps) {
  const [remainingTime, setRemainingTime] = useState(getRemainingTime(deal.enddatetime));
  const discount = calculateDiscount(deal.price_old || deal.price, deal.price_now_clean || deal.sale_price);

  // Update remaining time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime(deal.enddatetime));
    }, 60000);

    return () => clearInterval(interval);
  }, [deal.enddatetime]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Parse shortspecs HTML to list items
  const specs = deal.shortspecs
    ?.replace(/<[^>]*>/g, '\n')
    .split('\n')
    .filter((s) => s.trim())
    .slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-700/80 hover:bg-slate-600 transition-colors text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-500 text-white font-bold rounded-full text-sm">
            -{discount}%
          </div>
        )}

        {/* Product image */}
        <div className="relative h-56 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center p-4">
          {deal.image_link ? (
            <img
              src={deal.image_link}
              alt={deal.title}
              className="max-h-full max-w-full object-contain drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-slate-600 rounded-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Brand */}
          {deal.brand && (
            <p className="text-ibood-orange text-sm font-semibold uppercase tracking-wider mb-1">
              {deal.brand}
            </p>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {deal.title}
          </h2>

          {/* Short description */}
          {deal.description && (
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {deal.description.replace(/<[^>]*>/g, '').slice(0, 150)}
            </p>
          )}

          {/* Specs */}
          {specs && specs.length > 0 && (
            <ul className="mb-4 space-y-1">
              {specs.map((spec, i) => (
                <li key={i} className="flex items-start text-sm text-slate-300">
                  <span className="text-ibood-orange mr-2">•</span>
                  {spec}
                </li>
              ))}
            </ul>
          )}

          {/* Price section */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-green-400">
              {formatPrice(deal.price_now_clean || deal.sale_price)}
            </span>
            {deal.price_old && (
              <span className="text-lg text-slate-500 line-through">
                {formatPrice(deal.price_old)}
              </span>
            )}
          </div>

          {/* Timer */}
          {!remainingTime.expired && (
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Deal eindigt over {remainingTime.hours}u {remainingTime.minutes}m
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <a
              href={deal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-6 bg-ibood-orange hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 text-center shadow-lg shadow-orange-500/25"
            >
              Bekijk Deal
            </a>
            <button
              onClick={onClose}
              className="py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
