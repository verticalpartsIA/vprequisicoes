import { FreightRequestForm } from "@/components/forms/M5/FreightRequestForm";

export default function FreightPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Requisição de Frete</h1>
            <span className="px-3 py-1 bg-brand/20 text-brand text-xs font-bold rounded-full border border-brand/30">
              M5
            </span>
          </div>
          <p className="text-slate-400 text-lg">Módulo de Logística e Transporte de Cargas</p>
        </div>
      </div>

      <FreightRequestForm />
    </main>
  );
}
