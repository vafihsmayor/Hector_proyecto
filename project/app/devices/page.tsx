'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Search, Eye, CreditCard as Edit, Trash2 } from 'lucide-react';
import { mockBeacons } from '@/lib/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function DevicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBeacons = mockBeacons.filter((beacon) => {
    const matchesSearch =
      beacon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beacon.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beacon.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || beacon.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'device_id',
      label: 'ID Dispositivo',
      render: (value: string) => (
        <span className="font-mono text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (value: string) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'location',
      label: 'Ubicación',
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
        <span className="text-sm text-slate-600">
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
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Gestión de Dispositivos</h1>
              <p className="text-slate-600">Administración de beacons BLE registrados</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              Agregar Dispositivo
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="disconnected">Desconectados</option>
                  <option value="maintenance">En mantenimiento</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Dispositivos</p>
              <p className="text-2xl font-bold text-slate-900">{mockBeacons.length}</p>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-4 bg-green-50">
              <p className="text-sm text-green-700 mb-1">Activos</p>
              <p className="text-2xl font-bold text-green-700">
                {mockBeacons.filter((b) => b.status === 'active').length}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-700 mb-1">Inactivos</p>
              <p className="text-2xl font-bold text-slate-700">
                {mockBeacons.filter((b) => b.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4 bg-red-50">
              <p className="text-sm text-red-700 mb-1">Desconectados</p>
              <p className="text-2xl font-bold text-red-700">
                {mockBeacons.filter((b) => b.status === 'disconnected').length}
              </p>
            </div>
          </div>

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
