import { ProductRequestForm } from "@/components/forms/M1/ProductRequestForm";

export default function ProductsPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Requisição de Produtos</h1>
        <p className="text-slate-400 text-lg">Módulo M1 - Suprimentos e Materiais</p>
      </div>

      <ProductRequestForm />
    </main>
  );
}
