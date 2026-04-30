'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Plane, Wrench, Hammer,
  Truck, PackageSearch, FileSearch, ShieldCheck,
  ShoppingCart, ClipboardCheck, Activity, LogOut,
  ChevronDown, User, Menu, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SidebarUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface SidebarProps {
  user: SidebarUser | null;
}

const NAV_ITEMS = [
  {
    section: 'Módulos',
    items: [
      { href: '/dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
      { href: '/products',     label: 'M1 — Produtos',    icon: Package },
      { href: '/travel',       label: 'M2 — Viagens',     icon: Plane },
      { href: '/services',     label: 'M3 — Serviços',    icon: Wrench },
      { href: '/maintenance',  label: 'M4 — Manutenção',  icon: Hammer },
      { href: '/freight',      label: 'M5 — Frete',       icon: Truck },
      { href: '/rental',       label: 'M6 — Locação',     icon: PackageSearch },
    ],
  },
  {
    section: 'Fluxo',
    items: [
      { href: '/quotation',    label: 'V2 — Cotação',     icon: FileSearch },
      { href: '/approval',     label: 'V3 — Aprovação',   icon: ShieldCheck },
      { href: '/purchasing',   label: 'V4 — Compras',     icon: ShoppingCart },
      { href: '/receiving',    label: 'V5 — Recebimento', icon: ClipboardCheck },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/logs',         label: 'Logs de Atividades', icon: Activity },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  requester: 'Solicitante',
  quoter:    'Cotador',
  approver:  'Aprovador',
  buyer:     'Comprador',
  receiver:  'Recebedor',
  admin:     'Administrador',
};

const ROLE_COLORS: Record<string, string> = {
  requester: 'bg-blue-50 text-blue-700 border-blue-200',
  quoter:    'bg-violet-50 text-violet-700 border-violet-200',
  approver:  'bg-amber-50 text-amber-700 border-amber-200',
  buyer:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  receiver:  'bg-cyan-50 text-cyan-700 border-cyan-200',
  admin:     'bg-brand/10 text-brand border-brand/20',
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Sessão encerrada');
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-8 shrink-0">
        <Image
          src="/logo.png"
          alt="VPRequisições — VerticalParts"
          width={160}
          height={48}
          className="object-contain w-auto h-10"
          priority
        />
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto space-y-5 pb-4">
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-1">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(href)
                      ? 'bg-brand/10 text-brand'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Utilizador */}
      {user && (
        <div className="shrink-0 pt-4 border-t border-surface-border space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="px-3 flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${ROLE_COLORS[user.role] || ROLE_COLORS.requester}`}>
              {ROLE_LABELS[user.role] || user.role}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 bg-surface-card border-r border-surface-border shadow-sm hidden md:flex flex-col p-6 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-xl shadow-sm"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-xl p-6 flex flex-col">
            <div className="flex justify-end mb-2">
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
