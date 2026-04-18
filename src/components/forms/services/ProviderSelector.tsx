'use client';
import React from 'react';
import { UseFormRegister, FieldErrors, Control, useWatch } from 'react-hook-form';
import { User, Briefcase, Contact } from 'lucide-react';
import { PROVIDER_TYPES } from '@/../packages/modules/M3-services/constants';

interface ProviderSelectorProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  control: Control<any>;
}

export const ProviderSelector = ({ register, errors, control }: ProviderSelectorProps) => {
  const providerType = useWatch({ control, name: 'provider_type' });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-4">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
          Tipo de Fornecedor Sugerido
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVIDER_TYPES.map((type) => (
            <label
              key={type.value}
              className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                providerType === type.value
                  ? 'bg-brand/5 border-brand ring-4 ring-brand/10'
                  : 'bg-slate-50 border-surface-border grayscale hover:grayscale-0'
              }`}
            >
              <input
                type="radio"
                {...register('provider_type')}
                value={type.value}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${providerType === type.value ? 'bg-brand text-slate-950' : 'bg-white text-slate-500'}`}>
                  {type.value === 'PF' ? (
                    <User className="w-6 h-6" />
                  ) : (
                    <Briefcase className="w-6 h-6" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black uppercase tracking-tighter ${
                    providerType === type.value ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {type.label}
                  </span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">
                    {type.value === 'PF' ? 'Autônomo / Consultor' : 'Empresa / Prestadora'}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nome / Razão Social */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
            {providerType === 'PF' ? 'Nome Completo' : 'Razão Social'}
          </label>
          <input
            {...register('provider_name')}
            className="w-full bg-white border-2 border-surface-border rounded-2xl p-4 text-sm text-slate-900 focus:border-brand outline-none transition-all"
            placeholder={providerType === 'PF' ? "Ex: João da Silva" : "Ex: Tecnologia Ltda"}
          />
          {errors.provider_name && (
            <p className="text-[10px] font-bold text-rose-500 ml-1">
              {errors.provider_name.message as string}
            </p>
          )}
        </div>

        {/* Documento (CPF / CNPJ) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
            Documento ({providerType === 'PF' ? 'CPF' : 'CNPJ'})
          </label>
          <div className="relative">
            <Contact className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              {...register('provider_document')}
              className="w-full bg-white border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-slate-900 focus:border-brand outline-none transition-all"
              placeholder={providerType === 'PF' ? "000.000.000-00" : "00.000.000/0000-00"}
            />
          </div>
          {errors.provider_document && (
            <p className="text-[10px] font-bold text-rose-500 ml-1">
              {errors.provider_document.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
