import Papa from 'papaparse';
import { Deal } from '@/types';

interface CSVRow {
  id?: string;
  title?: string;
  short_title?: string;
  description?: string;
  brand?: string;
  price?: string;
  sale_price?: string;
  price_now_clean?: string;
  price_old?: string;
  image_link?: string;
  link?: string;
  google_product_category?: string;
  shortspecs?: string;
  availability?: string;
  enddatetime?: string;
  [key: string]: string | undefined;
}

export function parseCSV(csvText: string): Deal[] {
  const result = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors);
  }

  return result.data
    .filter((row) => row.id && row.title)
    .map((row) => ({
      id: row.id || '',
      title: row.title || '',
      short_title: row.short_title || row.title || '',
      description: row.description || '',
      brand: row.brand || '',
      price: row.price || '',
      sale_price: row.sale_price || '',
      price_now_clean: row.price_now_clean || extractPrice(row.sale_price || ''),
      price_old: row.price_old || extractPrice(row.price || ''),
      image_link: row.image_link || '',
      link: row.link || '',
      google_product_category: row.google_product_category || '',
      shortspecs: row.shortspecs || '',
      availability: row.availability || 'in stock',
      enddatetime: row.enddatetime || '',
    }));
}

function extractPrice(priceStr: string): string {
  const match = priceStr.match(/[\d.,]+/);
  return match ? match[0].replace('.', ',') : '0';
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: string, salePrice: string): number {
  const original = parseFloat(originalPrice.replace(',', '.').replace(/[^\d.]/g, ''));
  const sale = parseFloat(salePrice.replace(',', '.').replace(/[^\d.]/g, ''));

  if (isNaN(original) || isNaN(sale) || original <= 0) return 0;

  return Math.round(((original - sale) / original) * 100);
}

// Format price for display
export function formatPrice(price: string): string {
  const numPrice = parseFloat(price.replace(',', '.').replace(/[^\d.]/g, ''));
  if (isNaN(numPrice)) return '€0,00';
  return `€${numPrice.toFixed(2).replace('.', ',')}`;
}

// Parse end datetime and return remaining time
export function getRemainingTime(endDatetime: string): {
  hours: number;
  minutes: number;
  expired: boolean;
} {
  try {
    const endDate = new Date(endDatetime);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, expired: false };
  } catch {
    return { hours: 24, minutes: 0, expired: false };
  }
}
