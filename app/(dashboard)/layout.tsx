'use client';

import { useState, useEffect } from 'react';
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

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);


  const meta = PAGE_META[pathname] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="flex min-h-screen bg-gray-100/90 text-gray-800">
      {/* Sidebar - Sticky on desktop, drawer on mobile */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed((prev) => !prev)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}