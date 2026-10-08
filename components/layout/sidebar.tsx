'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  PenTool,
  FileText,
  RefreshCw,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const MENU = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Daftar Pengembangan TI', href: '/daftar-pengembangan', icon: List },
  { label: 'PIR Form', href: '/pir-form', icon: PenTool },
  { label: 'Laporan PIR', href: '/laporan-pir', icon: FileText },
  { label: 'Tindak Lanjut', href: '/tindak-lanjut', icon: RefreshCw },
  { label: 'Notifikasi', href: '/notifikasi', icon: Bell, badge: 5 },
  { label: 'Pengaturan', href: '/pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className="w-65 h-screen flex flex-col text-white"
      style={{
        background: 'linear-gradient(180deg, #1e3a8a 0%, #059669 100%)',
      }}
    >
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
            <span className="text-blue-900 font-bold text-lg">P</span>
          </div>
          <div>
            <div className="font-bold text-sm">PT PUSRI</div>
            <div className="text-xs text-blue-100">Palembang - Divisi TI</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition',
                active
                  ? 'bg-white/15 font-semibold'
                  : 'hover:bg-white/10 text-blue-50'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="text-sm mb-2">
          <div className="font-semibold">{user?.nama || 'User'}</div>
          <div className="text-xs text-blue-100">{user?.jabatan || '-'}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-blue-100 hover:text-white"
        >
          <LogOut size={14} /> Keluar
        </button>
      </div>
    </aside>
  );
}