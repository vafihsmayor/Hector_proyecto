'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Save, Bell, Database, Shield, Zap } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    alertsEnabled: true,
    emailNotifications: true,
    batteryThreshold: 20,
    criticalBatteryThreshold: 5,
    disconnectionTimeout: 48,
    dataRetentionDays: 90,
    autoBackup: true,
    maintenanceAlerts: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Configuración guardada exitosamente');
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Configuración del Sistema</h1>
            <p className="text-slate-400 font-medium">Personaliza los parámetros de monitoreo y alertas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-400" />
                  Alertas y Notificaciones
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <p className="font-bold text-white">Habilitar Alertas</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Activar sistema de alertas inteligentes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.alertsEnabled}
                        onChange={(e) =>
                          setSettings({ ...settings, alertsEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <p className="font-bold text-white">Notificaciones por Email</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Recibir alertas críticas por correo
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          setSettings({ ...settings, emailNotifications: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <p className="font-bold text-white">Alertas de Mantenimiento</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Notificaciones predictivas de mantenimiento
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceAlerts}
                        onChange={(e) =>
                          setSettings({ ...settings, maintenanceAlerts: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Umbrales de Monitoreo
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Umbral de Batería Baja (%)
                    </label>
                    <input
                      type="number"
                      value={settings.batteryThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, batteryThreshold: parseInt(e.target.value) })
                      }
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold tabular-nums"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Genera alerta cuando la batería está por debajo de este nivel
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Umbral de Batería Crítica (%)
                    </label>
                    <input
                      type="number"
                      value={settings.criticalBatteryThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          criticalBatteryThreshold: parseInt(e.target.value),
                        })
                      }
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold tabular-nums"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Genera alerta crítica cuando la batería está por debajo de este nivel
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Tiempo de Desconexión (horas)
                    </label>
                    <input
                      type="number"
                      value={settings.disconnectionTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          disconnectionTimeout: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="168"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold tabular-nums"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Genera alerta si el dispositivo no envía señal durante este período
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Gestión de Datos
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Retención de Datos (días)
                    </label>
                    <input
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) =>
                        setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })
                      }
                      min="30"
                      max="365"
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold tabular-nums"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Tiempo que se mantienen los datos históricos
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <p className="font-bold text-white">Respaldo Automático</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Realizar copias de seguridad periódicas
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) =>
                          setSettings({ ...settings, autoBackup: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Configuración
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Información
                </h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Versión</p>
                    <p className="text-sm font-bold text-white">v1.2.0-PRO</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Dispositivo</p>
                    <p className="text-sm font-bold text-white">BC04P Sentinel</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Entorno</p>
                    <p className="text-sm font-bold text-indigo-400">Azure Backend</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Motor Predictivo</p>
                    <p className="text-sm font-bold text-emerald-400">Active ML-Core</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden group">
                <Zap className="w-12 h-12 text-amber-500/10 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform" />
                <h4 className="font-black uppercase tracking-widest text-xs text-amber-500 mb-3">Aviso Crítico</h4>
                <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                  Los umbrales afectan la generación de alertas en tiempo real. Configura valores según las especificaciones operativas.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
