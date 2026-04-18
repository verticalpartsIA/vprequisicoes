import { AuctionResult, AuctionStatus } from '@modules/purchasing/types';

export const simulateAuction = async (
  ticketId: string, 
  supplierList: string[], 
  initialPrice: number
): Promise<AuctionResult> => {
  return new Promise((resolve) => {
    console.log(`[Auction Engine] Instando leilão para ticket ${ticketId}...`);
    
    // Simulação de delay de 2 segundos para o leilão "acontecer"
    setTimeout(() => {
      // Lógica de sorteio para simular lances
      const participants = supplierList.length;
      const reductionFactor = 0.85 + (Math.random() * 0.10); // Redução de 5% a 15%
      const finalPrice = initialPrice * reductionFactor;
      const winner = supplierList[Math.floor(Math.random() * participants)];

      const result: AuctionResult = {
        auction_id: `AUC-${Date.now()}`,
        winning_supplier: winner,
        final_price: Number(finalPrice.toFixed(2)),
        participants,
        completed_at: new Date().toISOString(),
        log: [
          `Leilão iniciado com preço base de R$ ${initialPrice.toFixed(2)}`,
          `${participants} fornecedores convidados para a rodada digital.`,
          `Lance de ${supplierList[0]} reduz preço para R$ ${(initialPrice * 0.95).toFixed(2)}`,
          `Lance agressivo de ${winner} reduz para R$ ${finalPrice.toFixed(2)}`,
          `Leilão encerrado por tempo limite. Vencedor: ${winner}`
        ]
      };

      // Persistir no localStorage para o front recuperar se houver refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem(`auction_result_${ticketId}`, JSON.stringify(result));
      }

      resolve(result);
    }, 2000);
  });
};

export const getAuctionStatus = (ticketId: string): AuctionStatus => {
  if (typeof window === 'undefined') return 'pending';
  const saved = localStorage.getItem(`auction_result_${ticketId}`);
  return saved ? 'completed' : 'pending';
};

export const formatAuctionLog = (result: AuctionResult): string => {
  return result.log.join('\n');
};
