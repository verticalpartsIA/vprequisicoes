'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function SSOLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleSSO() {
      const ssoToken = searchParams.get('sso_token');
      const ssoRefresh = searchParams.get('sso_refresh');
      const next = searchParams.get('next') || '/dashboard';

      if (!ssoToken || !ssoRefresh) {
        router.replace('/login?error=sso_missing_tokens');
        return;
      }

      // Importa a sessão
      const { data, error } = await supabase.auth.setSession({
        access_token: ssoToken,
        refresh_token: ssoRefresh,
      });

      if (error) {
        console.error('[SSO] Erro ao importar sessão:', error.message);
        router.replace('/login?error=sso_invalid_session');
        return;
      }

      // Garante que o profile existe
      if (data.user) {
        await supabase.from('req_profiles').upsert({
          id: data.user.id,
          email: data.user.email ?? '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utilizador',
          role: 'requester',
        }, { onConflict: 'id', ignoreDuplicates: true });
      }

      // Sucesso! Redireciona limpo
      router.replace(next);
    }

    handleSSO();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-slate-600 font-medium">Autenticando no VPRequisições...</p>
    </div>
  );
}

export default function SSOHandlerPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SSOLoader />
    </Suspense>
  );
}
