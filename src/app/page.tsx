import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard BI</h1>
        <p className="text-slate-400">Bem-vindo ao sistema vprequisições v2</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Requisições do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+128</div>
            <p className="text-xs text-slate-500">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cotações Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-slate-500">Média de 3 fornecedores por ticket</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-red-400">5 urgentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Economia Gerada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.450</div>
            <p className="text-xs text-green-400">+R$ 2.400 este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card className="p-8 flex flex-col items-center justify-center text-center opacity-70 border-dashed">
        <div className="text-slate-400 italic">Gráficos Analíticos e BI (Em Breve)</div>
      </Card>
    </div>
  );
}
