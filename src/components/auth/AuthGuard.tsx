'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Timeout de segurança: se não carregar em 10s, mostra erro
    const timer = setTimeout(() => {
      if (loading) {
        console.error('[AuthGuard] Timeout atingido. Supabase pode estar inacessível.');
        setError('O sistema está demorando muito para responder. Verifique sua conexão ou chaves de API.');
      }
    }, 10000);

    async function checkAuth() {
      try {
        console.log('[AuthGuard] Verificando sessão...');
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('[AuthGuard] Erro no Supabase:', authError);
          setError(`Erro de Autenticação: ${authError.message}`);
          return;
        }

        const isPublic = 
          pathname.startsWith('/login') || 
          pathname.startsWith('/auth/') || 
          pathname === '/';

        console.log('[AuthGuard] Sessão:', session ? 'Logado' : 'Deslogado', '| Rota:', pathname);

        if (!session && !isPublic) {
          router.replace(`/login?redirectTo=${pathname}`);
        } else if (session && (pathname === '/login' || pathname === '/')) {
          router.replace('/dashboard');
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('[AuthGuard] Erro Crítico:', err);
        setError(`Erro Crítico de Inicialização: ${err.message}`);
      }
    }

    checkAuth();
    return () => clearTimeout(timer);
  }, [pathname, router, searchParams, loading]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-md">
          <h2 className="text-red-500 font-bold mb-2">Ops! Algo deu errado</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (loading && !pathname.startsWith('/login') && pathname !== '/') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return <>{children}</>;
}
