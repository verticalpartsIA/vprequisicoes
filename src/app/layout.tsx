import '@/styles/global.css';
import { Inter } from 'next/font/google';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SidebarWrapper } from '@/components/layout/SidebarWrapper';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VPRequisições - VerticalParts',
  description: 'Sistema de Requisições e Compras da VerticalParts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <Suspense fallback={<div className="p-10 text-slate-500">Iniciando sistema...</div>}>
          <AuthGuard>
            <div className="flex min-h-screen">
              <SidebarWrapper />
              <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
              </main>
            </div>
          </AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}
