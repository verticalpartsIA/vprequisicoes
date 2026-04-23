import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session silencioso (não usar getSession aqui — usar getUser)
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rotas públicas (incluindo SSO entry-point)
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/sso') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  // Sem sessão → verifica se há SSO token na URL antes de redirecionar para login
  if (!user && !isPublic) {
    const ssoToken   = request.nextUrl.searchParams.get('sso_token');
    const ssoRefresh = request.nextUrl.searchParams.get('sso_refresh');

    if (ssoToken && ssoRefresh) {
      // Redireciona para o handler SSO com os tokens e o destino original
      const ssoUrl = request.nextUrl.clone();
      ssoUrl.pathname = '/api/sso';
      ssoUrl.search   = '';
      ssoUrl.searchParams.set('sso_token',   ssoToken);
      ssoUrl.searchParams.set('sso_refresh', ssoRefresh);
      ssoUrl.searchParams.set('next', pathname === '/' ? '/dashboard' : pathname);
      return NextResponse.redirect(ssoUrl);
    }

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Com sessão na página de login → redireciona para dashboard
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Redireciona raiz para dashboard
  if (user && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Exclui ficheiros estáticos e de imagem
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
