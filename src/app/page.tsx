import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-light">Sistema v2.0</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Painel Operacional</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Dashboard <span className="text-brand">BI</span>
          </h1>
          <p className="text-slate-400 max-w-md">
            Bem-vindo ao centro de comando da VerticalParts. Monitore requisições, cotações e aprovações em tempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Requisições do Mês', value: '+128', sub: '+12% vs mês anterior', color: 'text-brand' },
          { title: 'Cotações Pendentes', value: '42', sub: 'Média 3 forn. / ticket', color: 'text-blue-400' },
          { title: 'Aguardando Aprovação', value: '15', sub: '5 urgentes', color: 'text-red-400' },
          { title: 'Economia Gerada', value: 'R$ 12.450', sub: '+R$ 2.400 este mês', color: 'text-emerald-400' },
        ].map((item) => (
          <Card key={item.title} className="border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold tracking-tight ${item.color}`}>{item.value}</div>
              <p className="text-[10px] font-medium text-slate-400 mt-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-12 flex flex-col items-center justify-center text-center opacity-60 border-dashed bg-slate-50/50">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4 animate-pulse" />
        <div className="text-slate-500 font-semibold tracking-tight">Métricas Avançadas & BI</div>
        <div className="text-slate-400 text-xs mt-1">Implementando integração com PowerBI / Supabase Analytics</div>
      </Card>
    </div>
  );
}
