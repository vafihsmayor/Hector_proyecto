'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Search, Eye, CreditCard as Edit, Trash2, CircleX as XCircle } from 'lucide-react';
import type { Beacon } from '@/lib/types';
import { getBeacons, createBeacon } from '../../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DevicesPage() {
  const { user } = useAuth();
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isAdmin = user?.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    model: 'Beacon v1',
    location: '',
  });

  const loadBeacons = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getBeacons();
      setBeacons(data);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar la lista de beacons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBeacons();
  }, []);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await createBeacon(formData);
      setIsModalOpen(false);
      setFormData({ device_id: '', name: '', model: 'Beacon v1', location: '' });
      loadBeacons();
    } catch (err: any) {
      setError(err?.message || 'Error al crear el dispositivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBeacons = useMemo(() => beacons.filter((beacon) => {
    const matchesSearch =
      beacon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beacon.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (beacon.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || beacon.status === statusFilter;

    return matchesSearch && matchesStatus;
  }), [beacons, searchTerm, statusFilter]);

  const columns = [
    {
      key: 'device_id',
      label: 'ID Dispositivo',
      render: (value: string) => (
        <span className="font-mono text-xs font-bold text-white tracking-wider">{value}</span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (value: string) => <span className="font-bold text-white mb-1 block">{value}</span>,
    },
    {
      key: 'location',
      label: 'Ubicación',
      render: (value: string) => <span className="text-slate-400 font-medium">{value}</span>,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'last_seen',
      label: 'Última Conexión',
      render: (value: string) => (
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest tabular-nums">
          {format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: es })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/devices/${row.id}`}
            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <>
              <button
                className="p-2 text-slate-400 hover:bg-white/5 rounded-xl transition-all"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Gestión de Dispositivos</h1>
              <p className="text-slate-400 font-medium">Administración de beacons BLE registrados</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Agregar Dispositivo
              </button>
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <h2 className="text-xl font-black text-white tracking-tight">Agregar Nuevo Dispositivo</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateDevice} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ID del Dispositivo (MAC/Serial)</label>
                    <input
                      required
                      type="text"
                      value={formData.device_id}
                      onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                      placeholder="Ej: BE:AC:ON:01:02:03"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nombre</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Beacon Almacén A"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ubicación</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Pasillo 4, Estante 2"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar Dispositivo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Todos los estados</option>
                  <option value="active" className="bg-slate-900">Activos</option>
                  <option value="inactive" className="bg-slate-900">Inactivos</option>
                  <option value="disconnected" className="bg-slate-900">Desconectados</option>
                  <option value="maintenance" className="bg-slate-900">En mantenimiento</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 font-bold text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-5 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Dispositivos</p>
              <p className="text-3xl font-black text-white">{beacons.length}</p>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">Activos</p>
              <p className="text-3xl font-black text-emerald-400 relative z-10">
                {beacons.filter((b) => b.status === 'active').length}
              </p>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-xl p-5 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Inactivos</p>
              <p className="text-3xl font-black text-slate-300">
                {beacons.filter((b) => b.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-2">Desconectados</p>
              <p className="text-3xl font-black text-rose-400 relative z-10">
                {beacons.filter((b) => b.status === 'disconnected').length}
              </p>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-rose-500 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
            </div>
          </div>

          {isLoading && (
            <div className="mb-6 text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Cargando dispositivos desde backend...</div>
          )}

          <DataTable
            columns={columns}
            data={filteredBeacons}
            emptyMessage="No se encontraron dispositivos que coincidan con los filtros"
          />
        </main>
      </div>
    </div>
  );
}
