/**
 * Normaliza um ticket vindo do mock (campos legados) ou do Supabase real
 * para campos consistentes com prefixo `_`.
 */
export function normalizeTicket(t: any) {
  if (!t) return t;
  const module: string = t.module ?? t.type ?? '';
  const moduleShort = module.includes('_') ? module.split('_')[0] : module;
  const ticketNumber = t.ticket_number ?? `${moduleShort}-${String(t.id).padStart(4, '0')}`;
  const requester = t.requester_name ?? t.requester_email ?? t.username ?? '—';
  const submittedAt = t.submitted_at ?? t.submittedAt ?? t.created_at ?? null;

  // Itens: vêm de req_ticket_items (real) ou de details.itens (mock)
  const itens: any[] = t.items ?? t.details?.itens ?? [];

  // Departamento
  const departamento = t.department_name ?? t.details?.departamento ?? t.departamento ?? 'Geral';

  // Justificativa
  const justificativa =
    t.description ??
    t.metadata?.justificativa ??
    t.details?.justificativa ??
    'Não informada';

  return {
    ...t,
    _moduleShort: moduleShort,
    _ticketNumber: ticketNumber,
    _requester: requester,
    _submittedAt: submittedAt,
    _itens: itens,
    _departamento: departamento,
    _justificativa: justificativa,
  };
}
