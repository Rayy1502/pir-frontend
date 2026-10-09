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
  ChevronLeft,
  ChevronRight,
  X,
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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-label="Tutup Sidebar"
        />
      )}

      {/* Sidebar Container (Sticky on Desktop, Fixed Drawer on Mobile) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col text-white shadow-xl transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:shadow-none',
          // Mobile state: slide in / out
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop width: collapsed vs expanded
          isCollapsed ? 'lg:w-20' : 'lg:w-64 w-72'
        )}
        style={{
          background: 'linear-gradient(180deg, #1e3a8a 0%, #059669 100%)',
        }}
      >
        {/* Brand & Toggle Header */}
        <div className="p-4 lg:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-white shrink-0 flex items-center justify-center shadow-md p-1 overflow-hidden">
              <img
                src="/Logo Emblem Pusri Dark.svg"
                alt="Logo PT PUSRI"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-bold text-sm leading-tight text-white">PT PUSRI</div>
                <div className="text-[11px] text-blue-100/80 leading-tight truncate">
                  Palembang - Divisi TI
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

          {/* Mobile Close Button (X) */}
          <button
            onClick={onCloseMobile}
            title="Tutup Menu"
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {MENU.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative',
                  active
                    ? 'bg-white/20 text-white font-semibold shadow-xs'
                    : 'hover:bg-white/10 text-blue-50/90 hover:text-white',
                  isCollapsed && 'lg:justify-center lg:px-2'
                )}
              >
                <Icon size={20} className="shrink-0" />
                
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}

                {item.badge && (
                  <span
                    className={cn(
                      'bg-rose-500 text-white font-medium text-xs rounded-full flex items-center justify-center',
                      isCollapsed
                        ? 'lg:absolute lg:top-1.5 lg:right-1.5 lg:w-2 lg:h-2 lg:p-0'
                        : 'px-2 py-0.5'
                    )}
                  >
                    {!isCollapsed && item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold text-white truncate">{user?.nama || 'User'}</div>
                <div className="text-xs text-blue-100/80 truncate">{user?.jabatan || '-'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-rose-200 hover:text-white transition w-full py-1.5 px-2 rounded-md hover:bg-white/10 cursor-pointer"
              >
                <LogOut size={14} /> Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                title={user?.nama || 'User'}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white"
              >
                {user?.nama?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-1.5 text-rose-200 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}