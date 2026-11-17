import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal ISO (e.g. "2026-11-17T00:00:00Z" atau "2026-11-17")
 * menjadi format Indonesia baku (e.g. "17 November 2026").
 */
export function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const cleaned = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleaned.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (!isNaN(day) && !isNaN(monthIdx) && monthIdx >= 0 && monthIdx < 12 && !isNaN(year)) {
      return `${day} ${bulan[monthIdx]} ${year}`;
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return cleaned;
}

/**
 * Mengambil hanya format YYYY-MM-DD dari string tanggal ber-timestamp (e.g. T00:00:00Z).
 */
export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
}

/**
 * Membersihkan satu baris teks masukan dari prefiks nama responden (e.g. "Budi: ...") dan penomoran/bullet.
 */
export function cleanAnonymizedText(text?: string | null): string {
  if (!text) return '';
  let cleaned = text.trim();
  const colonIdx = cleaned.indexOf(': ');
  if (colonIdx !== -1 && colonIdx < 35) {
    cleaned = cleaned.substring(colonIdx + 2).trim();
  }
  cleaned = cleaned.replace(/^[-*•\d.]+\s*/, '').trim();
  return cleaned;
}

/**
 * Merangkum dan membersihkan catatan kendala atau saran dari seluruh responden:
 * - Menghapus identitas / nama individu responden
 * - Menghilangkan duplikasi masukan
 * - Mengembalikan daftar poin ringkasan yang bersih dan anonim
 */
export function summarizeFeedback(text?: string | null): string {
  if (!text) return '';
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const uniquePoints: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const cleaned = cleanAnonymizedText(line);
    if (cleaned && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      uniquePoints.push(cleaned);
    }
  }

  return uniquePoints.join('\n');
}