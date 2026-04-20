/**
 * real-client.ts
 * Cliente HTTP real que chama as rotas Next.js /api/...
 * Tem a MESMA interface que mockApiClient (get/post/patch)
 * para que client.mock.ts possa delegar sem que os 19 componentes
 * consumidores precisem ser alterados.
 */

async function apiFetch(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT',
  path: string,
  body?: unknown
): Promise<any> {
  const base =
    typeof window !== 'undefined'
      ? '' // client-side: relative URL
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include', // envia cookies de sessão Supabase
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── helpers de mapeamento de path ────────────────────────────────────────────

/** extrai segmento de índice N de um path como /api/a/b/c/d */
function seg(path: string, n: number): string {
  return path.split('/').filter(Boolean)[n] ?? '';
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function realGet(path: string, params?: Record<string, string>): Promise<any> {
  // ── /api/requests  → GET /api/tickets ────────────────────────────────────
  if (path === '/api/requests') {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const data = await apiFetch('GET', `/api/tickets${qs}`);
    // Normalisa: retorna { status:'success', data: [...] }
    return { status: 'success', data: data.tickets ?? [] };
  }

  // ── /api/requests/rental → GET /api/tickets?module=M6_LOCACAO ────────────
  if (path === '/api/requests/rental') {
    const data = await apiFetch('GET', '/api/tickets?module=M6_LOCACAO');
    return { status: 'success', data: data.tickets ?? [] };
  }

  // ── /api/approval/tickets → GET /api/tickets?status=PENDING_APPROVAL ─────
  if (path === '/api/approval/tickets') {
    const data = await apiFetch('GET', '/api/tickets?status=PENDING_APPROVAL');
    return { status: 'success', data: data.tickets ?? [] };
  }

  // ── /api/purchasing/tickets → GET /api/tickets?status=APPROVED ───────────
  if (path === '/api/purchasing/tickets') {
    const status = params?.status ?? 'APPROVED';
    const data = await apiFetch('GET', `/api/tickets?status=${status}`);
    return { status: 'success', data: data.tickets ?? [] };
  }

  // ── /api/receiving/tickets → GET /api/tickets?status=RECEIVING ───────────
  if (path === '/api/receiving/tickets') {
    const status = params?.status ?? 'RECEIVING';
    const data = await apiFetch('GET', `/api/tickets?status=${status}`);
    return { status: 'success', data: data.tickets ?? [] };
  }

  // ── /api/dashboard/summary → GET /api/dashboard ──────────────────────────
  if (path === '/api/dashboard/summary') {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch('GET', `/api/dashboard${qs}`);
  }

  // ── /api/approval/tickets/{id}/audit → GET /api/tickets/{id} (audit_logs) ─
  const auditMatch = path.match(/^\/api\/approval\/tickets\/([^/]+)\/audit$/);
  if (auditMatch) {
    const data = await apiFetch('GET', `/api/tickets/${auditMatch[1]}`);
    return { status: 'success', data: data.audit_logs ?? [] };
  }

  // ── /api/approval/tickets/{id} → GET /api/approval/{id} ──────────────────
  const approvalMatch = path.match(/^\/api\/approval\/tickets\/([^/]+)$/);
  if (approvalMatch) {
    const data = await apiFetch('GET', `/api/approval/${approvalMatch[1]}`);
    return { status: 'success', data };
  }

  // ── /api/requests/{id} → GET /api/tickets/{id} ───────────────────────────
  const requestMatch = path.match(/^\/api\/requests\/([^/]+)$/);
  if (requestMatch) {
    const data = await apiFetch('GET', `/api/tickets/${requestMatch[1]}`);
    return { status: 'success', data: data.ticket ?? data };
  }

  // ── /api/quotation/tickets/{id} → GET /api/quotation/{id} ────────────────
  const quotationGetMatch = path.match(/^\/api\/quotation\/tickets\/([^/]+)$/);
  if (quotationGetMatch) {
    const data = await apiFetch('GET', `/api/quotation/${quotationGetMatch[1]}`);
    return { status: 'success', data };
  }

  throw new Error(`Endpoint GET não mapeado para real: ${path}`);
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function realPost(path: string, body: any): Promise<any> {
  // ── /api/requests/products → POST /api/tickets (M1) ─────────────────────
  if (path.includes('/api/requests/products')) {
    const data = await apiFetch('POST', '/api/tickets', { module: 'M1_PRODUTOS', ...body });
    return {
      status: 'success',
      data: {
        request_id: data.id,
        ticket_number: data.ticket_number,
        status: data.status ?? 'SUBMITTED',
        next_step: 'quotation',
        submitted_at: new Date().toISOString(),
      },
    };
  }

  // ── /api/requests/travel → POST /api/tickets (M2) ────────────────────────
  if (path === '/api/requests/travel') {
    const data = await apiFetch('POST', '/api/tickets', { module: 'M2_VIAGENS', ...body });
    return { status: 'success', data };
  }

  // ── /api/requests/services → POST /api/tickets (M3) ─────────────────────
  if (path === '/api/requests/services') {
    const data = await apiFetch('POST', '/api/tickets', { module: 'M3_SERVICOS', ...body });
    return { status: 'success', data };
  }

  // ── /api/requests/maintenance → POST /api/tickets (M4) ──────────────────
  if (path === '/api/requests/maintenance') {
    const data = await apiFetch('POST', '/api/tickets', { module: 'M4_MANUTENCAO', ...body });
    return { status: 'success', data };
  }

  // ── /api/requests/freight → POST /api/tickets (M5) ───────────────────────
  if (path === '/api/requests/freight') {
    const data = await apiFetch('POST', '/api/tickets', { module: 'M5_FRETE', ...body });
    return { status: 'success', data };
  }

  // ── /api/requests/rental → POST /api/tickets (M6) ────────────────────────
  if (path === '/api/requests/rental') {
    const data = await apiFetch('POST', '/api/tickets', { module: 'M6_LOCACAO', ...body });
    return { status: 'success', data };
  }

  // ── /api/approval/tickets/{id}/decide → POST /api/approval/{id} ──────────
  const approvalDecideMatch = path.match(/^\/api\/approval\/tickets\/([^/]+)\/decide$/);
  if (approvalDecideMatch) {
    const data = await apiFetch('POST', `/api/approval/${approvalDecideMatch[1]}`, body);
    return { status: 'success', data };
  }

  // ── /api/purchasing/tickets/{id}/auction → POST /api/purchasing/{id} ─────
  const auctionMatch = path.match(/^\/api\/purchasing\/tickets\/([^/]+)\/auction$/);
  if (auctionMatch) {
    const data = await apiFetch('POST', `/api/purchasing/${auctionMatch[1]}`, {
      method: 'auction',
      supplier_list: body.supplier_list,
    });
    return { status: 'success', data };
  }

  // ── /api/purchasing/tickets/{id}/direct → POST /api/purchasing/{id} ──────
  const directMatch = path.match(/^\/api\/purchasing\/tickets\/([^/]+)\/direct$/);
  if (directMatch) {
    const data = await apiFetch('POST', `/api/purchasing/${directMatch[1]}`, {
      method: 'direct',
      ...body,
    });
    return { status: 'success', data };
  }

  // ── /api/receiving/tickets/{id}/physical → POST /api/receiving/{id} ──────
  const physicalMatch = path.match(/^\/api\/receiving\/tickets\/([^/]+)\/physical$/);
  if (physicalMatch) {
    const data = await apiFetch('POST', `/api/receiving/${physicalMatch[1]}`, {
      type: 'physical',
      ...body,
    });
    return { status: 'success', data };
  }

  // ── /api/receiving/tickets/{id}/digital → POST /api/receiving/{id} ───────
  const digitalMatch = path.match(/^\/api\/receiving\/tickets\/([^/]+)\/digital$/);
  if (digitalMatch) {
    const data = await apiFetch('POST', `/api/receiving/${digitalMatch[1]}`, {
      type: 'digital',
      ...body,
    });
    return { status: 'success', data };
  }

  // ── /api/quotation/tickets/{id} → POST /api/quotation/{id} ───────────────
  const quotationMatch = path.match(/^\/api\/quotation\/tickets\/([^/]+)$/);
  if (quotationMatch) {
    const data = await apiFetch('POST', `/api/quotation/${quotationMatch[1]}`, body);
    return { status: 'success', data };
  }

  throw new Error(`Endpoint POST não mapeado para real: ${path}`);
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function realPatch(path: string, body: any): Promise<any> {
  // ── /api/quotation/tickets/{id}/draft → PATCH /api/quotation/{id}/draft ──
  const draftMatch = path.match(/^\/api\/quotation\/tickets\/([^/]+)\/draft$/);
  if (draftMatch) {
    const data = await apiFetch('PATCH', `/api/quotation/${draftMatch[1]}/draft`, body);
    return { status: 'success', data };
  }

  throw new Error(`Endpoint PATCH não mapeado para real: ${path}`);
}
