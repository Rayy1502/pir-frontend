'use client';

import { Search, Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({
  title,
  subtitle,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
}: HeaderProps) {
  const { user } = useAuthStore();
  const initial = user?.nama?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            title="Buka Menu"
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Desktop collapse toggle button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
            className="hidden lg:flex p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        )}

        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari proyek..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-56 lg:w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition"
          />
        </div>

        <button
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          title="Notifikasi"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            5
          </span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm shadow-xs">
            {initial}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-gray-800 leading-tight">
              {user?.nama || 'User'}
            </div>
            <div className="text-[11px] text-gray-400 leading-tight">
              {user?.role || 'User'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}