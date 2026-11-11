import { CurrencyCode } from '@/types';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: { showSign?: boolean; hideValue?: boolean }
): string {
  if (options?.hideValue) {
    return `${CURRENCY_SYMBOLS[currency]}••••••`;
  }
  const converted = amount * CURRENCY_RATES[currency];
  const absFormatted = Math.abs(converted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[currency];
  if (options?.showSign) {
    if (converted > 0) return `+${symbol}${absFormatted}`;
    if (converted < 0) return `-${symbol}${absFormatted}`;
  }
  return converted < 0 ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMatchTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(isoString);
}

export function generateReference(prefix: string): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
}

export function exportToCsv(filename: string, rows: Record<string, string | number | boolean | undefined>[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (val: string | number | boolean | undefined) => {
    const str = val === undefined || val === null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

