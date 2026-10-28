'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  List,
  LayoutGrid,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  Sparkles,
  Layers,
  Code2,
  Server,
  Monitor,
  Loader2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Star,
  Check,
} from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
import { pengaturanApi } from '@/lib/api/pengaturan';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { Proyek, StatusPIR, CreateProyekPayload } from '@/types/proyek';
import type { PengaturanUnitKerja } from '@/types/pengaturan';

export default function DaftarPengembanganPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      }
    >
      <DaftarPengembanganContent />
    </Suspense>
  );
}

function DaftarPengembanganContent() {
  const router = useRouter();

  // Data states
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<PengaturanUnitKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedUnitKerja, setSelectedUnitKerja] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'need_action' | 'pending' | 'terlambat' | 'selesai' | 'belum-jatuh-tempo'>('all');
  const [sortBy, setSortBy] = useState<'tanggal_desc' | 'tanggal_asc' | 'nama_asc' | 'nama_desc'>('tanggal_desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Project Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<CreateProyekPayload>({
    nama_kegiatan: '',
    kategori: 'Aplikasi',
    unit_kerja: '',
    vendor: '',
    tanggal_go_live: new Date().toISOString().split('T')[0],
  });

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [proyekData, unitData] = await Promise.all([
        proyekApi.list(),
        pengaturanApi.getAll().catch(() => []),
      ]);

      setProyekList(proyekData || []);
      setUnitKerjaList(unitData || []);
    } catch (err) {
      console.error('Gagal mengambil data proyek:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Category Icon helper
  const getCategoryIcon = (kat: string) => {
    switch (kat?.toLowerCase()) {
      case 'aplikasi':
        return <Code2 size={16} className="text-blue-600" />;
      case 'infrastruktur':
        return <Server size={16} className="text-purple-600" />;
      case 'euc':
      case 'end user computing':
        return <Monitor size={16} className="text-emerald-600" />;
      default:
        return <Layers size={16} className="text-gray-500" />;
    }
  };

  // Date Formatter helper
  const formatTanggal = (iso?: string) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return iso;
    }
  };

  // Calculated Stats
  const stats = useMemo(() => {
    const total = proyekList.length;
    const selesai = proyekList.filter((p) => p.status_pir === 'selesai').length;
    const pending = proyekList.filter((p) => p.status_pir === 'pending').length;
    const terlambat = proyekList.filter((p) => p.status_pir === 'terlambat').length;
    const belum = proyekList.filter((p) => p.status_pir === 'belum-jatuh-tempo').length;
    const needAction = pending + terlambat;
    const rate = total > 0 ? Math.round((selesai / total) * 100) : 0;

    return { total, selesai, pending, terlambat, belum, needAction, rate };
  }, [proyekList]);

  // Filtered & Sorted Projects
  const filteredList = useMemo(() => {
    return (proyekList || [])
      .filter((p) => {
        // Search filter
        const q = search.toLowerCase().trim();
        const matchSearch =
          !q ||
          (p.nama_kegiatan || '').toLowerCase().includes(q) ||
          (p.vendor || '').toLowerCase().includes(q) ||
          (p.unit_kerja || '').toLowerCase().includes(q);

        // Kategori filter
        const matchKategori =
          selectedKategori === 'all' || p.kategori === selectedKategori;

        // Unit Kerja filter
        const matchUnit =
          selectedUnitKerja === 'all' || p.unit_kerja === selectedUnitKerja;

        // Status Tab filter
        let matchStatus = true;
        if (statusTab === 'need_action') {
          matchStatus = p.status_pir === 'pending' || p.status_pir === 'terlambat';
        } else if (statusTab !== 'all') {
          matchStatus = p.status_pir === statusTab;
        }

        return matchSearch && matchKategori && matchUnit && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'tanggal_desc') {
          return new Date(b.tanggal_go_live).getTime() - new Date(a.tanggal_go_live).getTime();
        }
        if (sortBy === 'tanggal_asc') {
          return new Date(a.tanggal_go_live).getTime() - new Date(b.tanggal_go_live).getTime();
        }
        if (sortBy === 'nama_asc') {
          return (a.nama_kegiatan || '').localeCompare(b.nama_kegiatan || '');
        }
        if (sortBy === 'nama_desc') {
          return (b.nama_kegiatan || '').localeCompare(a.nama_kegiatan || '');
        }
        return 0;
      });
  }, [proyekList, search, selectedKategori, selectedUnitKerja, statusTab, sortBy]);

  // Paginated List
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedKategori, selectedUnitKerja, statusTab, sortBy, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = ['No', 'Nama Kegiatan', 'Kategori', 'Unit Kerja', 'Vendor', 'Tanggal Rilis', 'Status PIR'];
    const rows = filteredList.map((p, idx) => [
      idx + 1,
      `"${(p.nama_kegiatan || '').replace(/"/g, '""')}"`,
      `"${p.kategori || ''}"`,
      `"${(p.unit_kerja || '').replace(/"/g, '""')}"`,
      `"${(p.vendor || '-').replace(/"/g, '""')}"`,
      p.tanggal_go_live ? p.tanggal_go_live.split('T')[0] : '',
      `"${p.status_pir || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Pengembangan_TI_PUSRI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daftar proyek berhasil diekspor ke CSV');
  };

  // Handle Quick Create Project
  const handleCreateProject = async (andStartPIR: boolean) => {
    if (!newProject.nama_kegiatan.trim()) {
      setModalError('Nama kegiatan proyek wajib diisi');
      return;
    }
    if (!newProject.unit_kerja.trim()) {
      setModalError('Unit kerja pemilik wajib dipilih atau diisi');
      return;
    }
    if (!newProject.tanggal_go_live) {
      setModalError('Tanggal rilis wajib diisi');
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);

      const created = await proyekApi.create({
        nama_kegiatan: newProject.nama_kegiatan.trim(),
        kategori: newProject.kategori,
        unit_kerja: newProject.unit_kerja.trim(),
        vendor: newProject.vendor?.trim() || undefined,
        tanggal_go_live: newProject.tanggal_go_live,
      });

      setIsModalOpen(false);
      setNewProject({
        nama_kegiatan: '',
        kategori: 'Aplikasi',
        unit_kerja: '',
        vendor: '',
        tanggal_go_live: new Date().toISOString().split('T')[0],
      });

      await fetchData(true);

      if (andStartPIR && created?.id) {
        router.push(`/pir-form?proyek_id=${created.id}&step=1`);
      } else {
        showToast(`Proyek "${created.nama_kegiatan}" berhasil ditambahkan!`);
      }
    } catch (err: any) {
      setModalError(err.message || 'Gagal menyimpan proyek baru');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <List size={22} />
            </span>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
              Daftar Pengembangan TI
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
            Kelola dan pantau seluruh sistem aplikasi, infrastruktur, serta EUC PT PUSRI beserta tahapan evaluasi Post Implementation Review (PIR).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Muat Ulang Data"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-emerald-600' : ''} />
          </button>

          <button
            onClick={handleExportCSV}
            title="Ekspor ke CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
          >
            <Download size={16} />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition cursor-pointer"
          >
            <Plus size={18} />
            <span>Tambah Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proyek */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Proyek TI
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {stats.total} Proyek
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              Aplikasi, Infra & EUC
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
        </div>

        {/* PIR Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider">
              PIR Selesai
            </span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {stats.selesai} Proyek
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-emerald-700 font-semibold">
                {stats.rate}% selesai
              </span>
              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${stats.rate}%` }}
                />
              </div>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* PIR Pending */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-amber-700 uppercase tracking-wider">
              PIR Pending
            </span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              {stats.pending} Proyek
            </span>
            <span className="text-[11px] text-amber-700/80 mt-0.5 block">
              Menunggu evaluasi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>

        {/* PIR Terlambat */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-rose-700 uppercase tracking-wider">
              PIR Terlambat
            </span>
            <span className="text-2xl font-bold text-rose-600 mt-1 block">
              {stats.terlambat} Proyek
            </span>
            <span className="text-[11px] text-rose-600 mt-0.5 block">
              Lewat batas waktu
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Filter & Controls Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Status Tabs */}
        <div className="border-b border-gray-100 px-4 sm:px-6 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Semua Proyek', count: stats.total },
            { id: 'need_action', label: 'Perlu PIR Segera', count: stats.needAction, alert: stats.needAction > 0 },
            { id: 'terlambat', label: 'Terlambat', count: stats.terlambat, alert: stats.terlambat > 0 },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'selesai', label: 'Selesai PIR', count: stats.selesai },
            { id: 'belum-jatuh-tempo', label: 'Belum Jatuh Tempo', count: stats.belum },
          ].map((tab) => {
            const active = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  active
                    ? 'border-blue-700 text-blue-700 bg-blue-50/40'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-blue-700 text-white'
                      : tab.alert
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Selectors Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-56">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama kegiatan, vendor, unit kerja..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Kategori */}
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="Aplikasi">Aplikasi</option>
              <option value="Infrastruktur">Infrastruktur</option>
              <option value="EUC">EUC</option>
            </select>

            {/* Filter Unit Kerja */}
            <select
              value={selectedUnitKerja}
              onChange={(e) => setSelectedUnitKerja(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer max-w-48"
            >
              <option value="all">Semua Unit Kerja</option>
              {Array.from(
                new Set([
                  ...unitKerjaList.map((u) => u.unit_kerja),
                  ...proyekList.map((p) => p.unit_kerja),
                ])
              )
                .filter(Boolean)
                .sort()
                .map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
            </select>
          </div>

          {/* Right Toolbar: Sort & View Mode */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="tanggal_desc">Rilis: Terbaru</option>
                <option value="tanggal_asc">Rilis: Terlama</option>
                <option value="nama_asc">Nama: A - Z</option>
                <option value="nama_desc">Nama: Z - A</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-200/80 p-0.5 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Tampilan Grid Card"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Table or Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
            <span className="text-xs text-gray-500">Memuat daftar proyek pengembangan TI...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
                <Sparkles size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {proyekList.length === 0
                  ? 'Belum Ada Proyek Pengembangan TI'
                  : 'Tidak Ada Proyek yang Sesuai Filter'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                {proyekList.length === 0
                  ? 'Daftarkan proyek TI pertama Anda untuk mulai memantau tanggal rilis serta tahapan PIR otomatis.'
                  : 'Coba reset pencarian, ubah pilihan kategori, unit kerja, atau status tab.'}
              </p>
              {proyekList.length === 0 ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus size={16} /> Tambah Proyek Sekarang
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedKategori('all');
                    setSelectedUnitKerja('all');
                    setStatusTab('all');
                  }}
                  className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Nama Kegiatan & Kategori</th>
                  <th className="py-3 px-4">Unit Kerja</th>
                  <th className="py-3 px-4">Vendor / Pengembang</th>
                  <th className="py-3 px-4">Tanggal Rilis</th>
                  <th className="py-3 px-4">Status PIR</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedList.map((p) => {
                  const isSelesai = p.status_pir === 'selesai';
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Nama Kegiatan & Kategori */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-gray-100 border border-gray-200 group-hover:bg-white group-hover:border-blue-200 transition shrink-0 mt-0.5">
                            {getCategoryIcon(p.kategori)}
                          </div>
                          <div>
                            <Link
                              href={`/proyek/${p.id}`}
                              className="font-bold text-gray-900 group-hover:text-blue-700 transition hover:underline leading-snug line-clamp-2"
                            >
                              {p.nama_kegiatan}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {p.kategori}
                              </span>
                              {p.kepuasan ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                                  <Star size={12} className="fill-amber-400 text-amber-400" />
                                  {p.kepuasan.toFixed(1)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Unit Kerja */}
                      <td className="py-3.5 px-4 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-gray-400 shrink-0" />
                          <span className="font-medium text-xs sm:text-sm">{p.unit_kerja}</span>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={14} className="text-gray-400 shrink-0" />
                          <span className="text-xs sm:text-sm">{p.vendor || 'Internal Pusri'}</span>
                        </div>
                      </td>

                      {/* Tanggal Rilis */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium text-xs sm:text-sm">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{formatTanggal(p.tanggal_go_live)}</span>
                        </div>
                      </td>

                      {/* Status PIR */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status_pir} />
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isSelesai ? (
                            <button
                              onClick={() => router.push(`/pir-form?proyek_id=${p.id}&step=1`)}
                              className="inline-flex items-center gap-1 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>Buat PIR</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => router.push(`/proyek/${p.id}`)}
                              className="inline-flex items-center gap-1 border border-blue-800 text-blue-900 hover:bg-blue-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <span>Detail</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/proyek/${p.id}`)}
                            title="Lihat Detail Proyek"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <ExternalLink size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedList.map((p) => {
              const isSelesai = p.status_pir === 'selesai';
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Card Header: Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                        {getCategoryIcon(p.kategori)}
                        <span>{p.kategori}</span>
                      </span>
                      <StatusBadge status={p.status_pir} />
                    </div>

                    {/* Title */}
                    <div>
                      <Link
                        href={`/proyek/${p.id}`}
                        className="font-bold text-gray-900 group-hover:text-blue-700 transition hover:underline text-sm sm:text-base line-clamp-2"
                      >
                        {p.nama_kegiatan}
                      </Link>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 pt-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{p.unit_kerja}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{p.vendor || 'Internal TI Pusri'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span>Rilis: {formatTanggal(p.tanggal_go_live)}</span>
                      </div>
                    </div>

                    {/* Skor Kepuasan if any */}
                    {p.kepuasan && (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/70 flex items-center justify-between text-xs">
                        <span className="text-amber-800 font-medium">Kepuasan Pengguna</span>
                        <div className="flex items-center gap-1 font-bold text-amber-700">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{p.kepuasan.toFixed(1)} / 5.0</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/proyek/${p.id}`}
                      className="text-xs font-semibold text-gray-600 hover:text-blue-700 flex items-center gap-1 transition"
                    >
                      <span>Detail Proyek</span>
                      <ChevronRight size={14} />
                    </Link>

                    {!isSelesai ? (
                      <button
                        onClick={() => router.push(`/pir-form?proyek_id=${p.id}&step=1`)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Buat PIR</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Check size={12} />
                        <span>Terekam</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination & Summary Footer */}
        {filteredList.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan{' '}
                <strong className="text-gray-800">
                  {Math.min(filteredList.length, (currentPage - 1) * pageSize + 1)} -{' '}
                  {Math.min(filteredList.length, currentPage * pageSize)}
                </strong>{' '}
                dari <strong className="text-gray-800">{filteredList.length}</strong> proyek
              </span>
              <div className="flex items-center gap-1">
                <span>Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  // Show limited page numbers if total pages large
                  if (
                    pNum === 1 ||
                    pNum === totalPages ||
                    (pNum >= currentPage - 1 && pNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`min-w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          currentPage === pNum
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'border border-gray-200 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  if (pNum === currentPage - 2 || pNum === currentPage + 2) {
                    return (
                      <span key={pNum} className="px-1 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                title="Halaman Selanjutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Tambah Proyek Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-blue-900 to-indigo-900 text-white">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-white/10">
                  <Plus size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base">Tambah Proyek Pengembangan TI</h3>
                  <p className="text-xs text-blue-100/80">
                    Daftarkan sistem TI baru yang telah atau akan segera rilis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Nama Kegiatan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nama Kegiatan / Proyek TI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProject.nama_kegiatan}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, nama_kegiatan: e.target.value }))
                  }
                  placeholder="Contoh: Implementasi Sistem Monitoring PIR Terintegrasi"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Kategori & Tanggal Rilis (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Kategori Proyek <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProject.kategori}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, kategori: e.target.value as any }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer bg-white"
                  >
                    <option value="Aplikasi">Aplikasi</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="EUC">End User Computing (EUC)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Tanggal Rilis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newProject.tanggal_go_live}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, tanggal_go_live: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* Unit Kerja Pemilik */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Unit Kerja Pemilik Sistem <span className="text-rose-500">*</span>
                </label>
                {unitKerjaList.length > 0 ? (
                  <select
                    value={newProject.unit_kerja}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, unit_kerja: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer bg-white"
                  >
                    <option value="">-- Pilih Unit Kerja Pemilik --</option>
                    {unitKerjaList.map((u) => (
                      <option key={u.id} value={u.unit_kerja}>
                        {u.unit_kerja} (Batas PIR: {u.batas_waktu_bulan} Bulan)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newProject.unit_kerja}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, unit_kerja: e.target.value }))
                    }
                    placeholder="Contoh: Divisi Operasi TI / Departemen SDM"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>

              {/* Vendor / Tim Pengembang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Vendor / Tim Pengembang <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={newProject.vendor}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, vendor: e.target.value }))
                  }
                  placeholder="Contoh: PT Integrator Solusi / Tim In-House TI Pusri"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={modalLoading}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleCreateProject(false)}
                disabled={modalLoading}
                className="px-4 py-2 text-xs font-semibold bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                Simpan Saja
              </button>

              <button
                type="button"
                onClick={() => handleCreateProject(true)}
                disabled={modalLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {modalLoading && <Loader2 size={14} className="animate-spin" />}
                <span>Simpan & Buat PIR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
