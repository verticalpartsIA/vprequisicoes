'use client';

import React from 'react';
import { Plane, Bus, Car, Key } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';

interface TransportSelectorProps {
  register: UseFormRegister<any>;
  selected: string;
}

export const TransportSelector = ({ register, selected }: TransportSelectorProps) => {
  const modes = [
    { value: 'aviao', label: 'Avião', icon: Plane },
    { value: 'onibus', label: 'Ônibus', icon: Bus },
    { value: 'carro_proprio', label: 'Carro Próprio', icon: Car },
    { value: 'carro_locado', label: 'Carro Locado', icon: Key },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = selected === mode.value;

        return (
          <label
            key={mode.value}
            className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
              isActive
                ? 'bg-brand/10 border-brand shadow-lg shadow-brand/10'
                : 'bg-slate-50 border-surface-border hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              value={mode.value}
              {...register('transport_mode')}
              className="absolute opacity-0"
            />
            <Icon className={`w-8 h-8 mb-3 transition-colors ${isActive ? 'text-brand' : 'text-slate-500'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
              {mode.label}
            </span>
            {isActive && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full animate-pulse" />
            )}
          </label>
        );
      })}
    </div>
  );
};
