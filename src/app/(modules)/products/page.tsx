import { ProductRequestForm } from "@/components/forms/M1/ProductRequestForm";
import { PageFooterTutorial } from "@/components/layout/PageFooterTutorial";

export default function ProductsPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Requisição de Produtos</h1>
        <p className="text-slate-500 text-sm">Módulo M1 — Suprimentos e Materiais</p>
      </div>

      <ProductRequestForm />

      <PageFooterTutorial 
        steps={[
          "Descreva a necessidade",
          "Adicione os itens",
          "Informe departamento",
          "Envie para cotação"
        ]} 
      />
    </main>
  );
}
