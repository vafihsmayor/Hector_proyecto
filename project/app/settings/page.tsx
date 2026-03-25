'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuración del Sistema</h1>
            <p className="text-slate-600">Personaliza los parámetros de monitoreo y alertas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alertas y Notificaciones
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Habilitar Alertas</p>
                      <p className="text-sm text-slate-600">
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Notificaciones por Email</p>
                      <p className="text-sm text-slate-600">
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Alertas de Mantenimiento</p>
                      <p className="text-sm text-slate-600">
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Umbrales de Monitoreo
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Genera alerta cuando la batería está por debajo de este nivel
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Genera alerta crítica cuando la batería está por debajo de este nivel
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Genera alerta si el dispositivo no envía señal durante este período
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Gestión de Datos
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Tiempo que se mantienen los datos históricos
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Respaldo Automático</p>
                      <p className="text-sm text-slate-600">
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Información del Sistema
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Versión</p>
                    <p className="text-base font-semibold text-slate-900">v1.0.0</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Modelo de Dispositivo</p>
                    <p className="text-base font-semibold text-slate-900">Blue Charm BC04P</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Base de Datos</p>
                    <p className="text-base font-semibold text-slate-900">PostgreSQL</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Modelo ML</p>
                    <p className="text-base font-semibold text-slate-900">v1.0-simulated</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-2">Nota Importante</h4>
                <p className="text-sm text-yellow-800">
                  Los cambios en los umbrales de monitoreo afectarán la generación de alertas en
                  tiempo real. Asegúrate de configurar valores apropiados según las
                  especificaciones del dispositivo BC04P.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
