'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { supabase } from '@/lib/supabase/client';

export function SidebarWrapper() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('[SidebarWrapper] Carregando perfil...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from('req_profiles')
            .select('id, full_name, email, role')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setProfile(data);
          } else {
            setProfile({
              id: user.id,
              email: user.email ?? '',
              full_name: user.email?.split('@')[0] ?? 'Utilizador',
              role: 'requester'
            });
          }
        } else {
          console.log('[SidebarWrapper] Nenhum usuário logado.');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return <div className="w-64 bg-slate-100 border-r border-slate-200 animate-pulse" />;
  }

  if (!profile) {
    return null; // Não mostra a sidebar se não estiver logado
  }

  return <Sidebar user={profile} />;
}
