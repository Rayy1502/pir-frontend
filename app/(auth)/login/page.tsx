'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { ApiClientError } from '@/lib/api/client';

const loginSchema = z.object({
  nip: z.string().min(1, 'Username/NIP wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === '1') {
        setSessionExpired(true);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg('');
    try {
      await login(data.nip, data.password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Terjadi kesalahan, coba lagi');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-emerald-500 to-blue-900 text-white p-12 flex-col justify-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src="/Logo Emblem Pusri Dark.svg" alt="Logo" width="50" height="50" />
          </div>
          <div>
            <div className="font-bold text-lg">PT PUSRI</div>
            <div className="text-sm text-blue-100">Divisi Teknologi Informasi</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">PIR</h1>
        <p className="text-blue-100 max-w-md">
          Pantau Post Implementation Review proyek pengembangan TI: aplikasi,
          infrastruktur, dan end user computing.
        </p>
      </div>

      {/* Kanan - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white border-2 border-gray-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Masuk</h2>
          <p className="text-sm text-gray-600 mb-6">
            Gunakan akun internal PT PUSRI Anda.
          </p>
          {sessionExpired && !errorMsg && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-amber-600" />
              <span>Sesi Anda telah berakhir atau token kadaluarsa. Silakan masuk kembali.</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username / NIP
              </label>
              <input
                type="text"
                {...register('nip')}
                placeholder="cth: 19850312"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.nip && (
                <p className="text-xs text-red-600 mt-1">{errors.nip.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Masukkan password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded" />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Ingat saya
              </label>
            </div>

            <a href="#" className="text-sm text-blue-600 hover:underline block">
              Lupa password?
            </a>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg transition"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            © 2026 PT Pusri Palembang - Divisi TI
          </p>
        </div>
      </div>
    </div>
  );
}