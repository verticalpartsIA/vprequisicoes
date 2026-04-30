import { ProductRequestForm } from "@/components/forms/M1/ProductRequestForm";

export default function ProductsPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Requisição de Produtos</h1>
        <p className="text-slate-500 text-sm">Módulo M1 — Suprimentos e Materiais</p>
      </div>

      <ProductRequestForm />
    </main>
  );
}
