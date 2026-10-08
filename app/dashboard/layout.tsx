'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/Header';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Pantau status PIR proyek TI Anda' },
  '/daftar-pengembangan': { title: 'Daftar Pengembangan TI', subtitle: 'Daftar seluruh proyek TI' },
  '/pengaturan': { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' },
  '/pir-form': { title: 'PIR Form', subtitle: 'Pembuatan PIR' },
  '/laporan-pir': { title: 'Laporan PIR', subtitle: 'Ringkasan & ekspor laporan' },
  '/tindak-lanjut': { title: 'Tindak Lanjut', subtitle: 'Pantau tindak lanjut hasil PIR' },
  '/notifikasi': { title: 'Notifikasi', subtitle: 'Peringatan PIR otomatis' },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const meta = PAGE_META[pathname] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}