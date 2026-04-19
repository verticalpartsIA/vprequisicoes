/**
 * SSO Entry-Point — VPRequisições
 *
 * Recebido quando o utilizador clica no card VPRequisições dentro do vpsistema.
 * O vpsistema injeta ?sso_token=<access_token>&sso_refresh=<refresh_token> na URL.
 * Como ambos os apps partilham o mesmo projeto Supabase (ubdkoqxfwcraftesgmbw),
 * os tokens são válidos aqui. Basta chamar setSession e redirecionar.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const ssoToken   = searchParams.get('sso_token');
  const ssoRefresh = searchParams.get('sso_refresh');
  const next       = searchParams.get('next') ?? '/dashboard';

  if (!ssoToken || !ssoRefresh) {
    // Sem tokens → redireciona para login normal
    return NextResponse.redirect(`${origin}/login?error=sso_missing_tokens`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Importa a sessão do vpsistema (mesmo projeto Supabase — tokens válidos aqui)
  const { error } = await supabase.auth.setSession({
    access_token:  ssoToken,
    refresh_token: ssoRefresh,
  });

  if (error) {
    console.error('[SSO] setSession error:', error.message);
    return NextResponse.redirect(`${origin}/login?error=sso_invalid_session`);
  }

  // Garante que o req_profile existe (trigger cria automaticamente, mas pode ter falhado)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('req_profiles').upsert({
      id:        user.id,
      email:     user.email ?? '',
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Utilizador',
      role:      'requester',
    }, { onConflict: 'id', ignoreDuplicates: true });
  }

  // Redireciona para o destino pretendido (limpa tokens da URL)
  return NextResponse.redirect(`${origin}${next}`);
}
