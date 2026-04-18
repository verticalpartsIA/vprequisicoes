import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Busca perfil do utilizador
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single();

  const sidebarUser = profile
    ? { id: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role }
    : { id: user.id, email: user.email ?? '', full_name: user.email?.split('@')[0] ?? 'Utilizador', role: 'requester' };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={sidebarUser} />
      <main className="flex-1 p-8 overflow-y-auto bg-surface-bg">
        {children}
      </main>
    </div>
  );
}
