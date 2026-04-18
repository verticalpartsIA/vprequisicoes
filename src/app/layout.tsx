import type { Metadata } from "next";
import "../styles/global.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "vprequisições v2",
  description: "Sistema Unificado de Requisições VerticalParts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-surface-bg text-slate-100">
        <div className="flex min-h-screen">
          {/* Sidebar placeholder */}
          <aside className="w-64 border-r border-surface-border hidden md:flex flex-col p-6 space-y-4 shrink-0">
            <div className="text-brand font-bold text-xl tracking-tight mb-8">VPREQUISIÇÕES</div>
            <nav className="space-y-2">
              <a href="/" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">Dashboard</a>
              <a href="/products" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">M1 - Produtos</a>
              <a href="/travel" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">M2 - Viagens</a>
              <a href="/services" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">M3 - Serviços</a>
              <a href="/quotation" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">V2 - Cotação</a>
              <a href="/approval" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">V3 - Aprovação</a>
              <a href="/purchasing" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">V4 - Compras</a>
              <a href="/receiving" className="block py-2 px-3 rounded-md hover:bg-surface-card transition-colors">V5 - Recebimento</a>
            </nav>
          </aside>
         
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>

        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}