import type { Metadata } from "next";
import "../styles/global.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "VPRequisições",
  description: "Sistema Unificado de Requisições VerticalParts",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-surface-bg text-slate-900">
        {children}
        <Toaster richColors position="top-right" theme="light" />
      </body>
    </html>
  );
}
