'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Radio, 
  Activity, 
  TriangleAlert as AlertTriangle, 
  FlaskConical, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-blue-500' },
  { icon: Radio, label: 'Dispositivos', path: '/devices', color: 'text-emerald-500' },
  { icon: Activity, label: 'Histórico', path: '/history', color: 'text-purple-500' },
  { icon: AlertTriangle, label: 'Alertas', path: '/alerts', color: 'text-amber-500' },
  { icon: FlaskConical, label: 'Simulación', path: '/simulation', color: 'text-rose-500' },
  { icon: FileText, label: 'Reportes', path: '/reports', color: 'text-cyan-500' },
  { icon: Settings, label: 'Configuración', path: '/settings', color: 'text-slate-400' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mr-8 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="hidden lg:block ml-1">
              <h1 className="text-xl font-black leading-none tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                BEACON <span className="text-blue-500">PRO</span>
              </h1>
              <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-[0.2em]">Predictive AI</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap group ${
                    isActive
                      ? 'bg-blue-600/10 text-white border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] ${isActive ? item.color : item.color + ' opacity-70 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User & Actions Section */}
          <div className="flex items-center gap-4 ml-6">
            <button className="relative p-2.5 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all duration-300 shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-black animate-ping"></span>
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="hidden md:block text-right">
                <p className="text-sm font-black text-white">{user?.username || 'Usuario'}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{user?.role || 'Admin'}</p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-full blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center border border-white/10 shadow-xl cursor-pointer">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-300 transform hover:rotate-12"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
