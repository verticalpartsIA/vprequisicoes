import QuotationClient from './QuotationClient';

// Essa função é OBRIGATÓRIA para o build da Hostinger não falhar
export async function generateStaticParams() {
  // Criamos uma página "molde" para o ID 0. 
  // Na prática, qualquer ID que vier vai usar esse molde no navegador.
  return [{ id: '0' }];
}

export default function Page() {
  return <QuotationClient />;
}
