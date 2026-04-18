export const simulateAuction = async (ticketId: string, suppliers: string[], initialPrice: number) => {
  // Simula um leilão que reduz o preço em 10-20%
  const reduction = 0.8 + Math.random() * 0.1;
  const finalPrice = initialPrice * reduction;
  const winningSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];

  return {
    auction_id: `AUC-${ticketId}`,
    winning_supplier: winningSupplier,
    final_price: finalPrice,
    participants: suppliers.length,
    completed_at: new Date().toISOString(),
    log: [
      `Leilão iniciado para Ticket ${ticketId}`,
      `Lances recebidos de: ${suppliers.join(', ')}`,
      `Fornecedor ${winningSupplier} deu o lance vencedor de R$ ${finalPrice.toFixed(2)}`
    ]
  };
};

export const formatAuctionLog = (result: any) => {
  return result.log.join('\n');
};
