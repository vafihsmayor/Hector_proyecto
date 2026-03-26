import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Monitoreo - Mantenimiento Predictivo',
  description: 'Sistema de monitoreo y mantenimiento predictivo para dispositivos beacon BLE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={outfit.className}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
