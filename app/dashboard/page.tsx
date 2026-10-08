'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard PIR</h1>
        <p className="text-gray-600 mb-6">Selamat datang, {user.nama}</p>

        <div className="space-y-2 text-sm mb-6">
          <div><strong>NIP:</strong> {user.nip}</div>
          <div><strong>Jabatan:</strong> {user.jabatan}</div>
          <div><strong>Divisi:</strong> {user.divisi}</div>
          <div><strong>Unit:</strong> {user.unit}</div>
        </div>

        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}