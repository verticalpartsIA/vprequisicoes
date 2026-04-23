'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Building2 } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    department: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : error.message);
    } else {
      toast.success('Bem-vindo!');
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error('Informe o seu nome completo.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Conta criada! Verifique o seu e-mail para confirmar.');
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
            <span className="text-white font-black text-lg">VP</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">VPRequisições</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">VerticalParts · Sistema de Requisições</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-surface-border rounded-2xl shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-surface-border">
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${
                  mode === m
                    ? 'text-brand border-b-2 border-brand bg-brand/5'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <form
            onSubmit={mode === 'login' ? handleLogin : handleSignup}
            className="p-8 space-y-5"
          >
            {/* Campos extra no signup */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={form.full_name}
                    onChange={set('full_name')}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* E-mail */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                E-mail Corporativo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="seu@verticalparts.com.br"
                  value={form.email}
                  onChange={set('email')}
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : '••••••••'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={mode === 'signup' ? 8 : 1}
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-[0.98] transition-all shadow-lg shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                : mode === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta'
              }
            </button>

            {/* Info signup */}
            {mode === 'signup' && (
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                Após o cadastro, um administrador irá atribuir o seu perfil e permissões de acesso.
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-6">
          VerticalParts © {new Date().getFullYear()} · Uso interno
        </p>
      </div>
    </div>
  );
}
