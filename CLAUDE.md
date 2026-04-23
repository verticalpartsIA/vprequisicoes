# CLAUDE.md — VPRequisições

Guia completo para o Claude Code operar neste projeto sem precisar perguntar o que já foi decidido.

---

## 1. Identidade do Projeto

| Campo | Valor |
|-------|-------|
| Nome | VPRequisições |
| Repositório | https://github.com/verticalpartsIA/vprequisicoes |
| Branch principal | `main` |
| Branch de desenvolvimento | `feature/m5-freight-module` (ou `develop`) |
| Domínio produção | `requisicoes.vpsistema.com` |
| Stack | Next.js 16 · App Router · TypeScript · Supabase · Docker |

---

## 2. Supabase (Banco de Dados)

| Campo | Valor |
|-------|-------|
| Project URL | `https://jsnnjsjnqqcqynjncmvz.supabase.co` |
| Project Ref | `jsnnjsjnqqcqynjncmvz` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbm5qc2pucXFjcXluam5jbXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDcxMDUsImV4cCI6MjA5MjEyMzEwNX0.xzt0F0DHe9_H7lN4qT3vmiEHNIjUPJ3ulhUiD7fB9C0` |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbm5qc2pucXFjcXluam5jbXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0NzEwNSwiZXhwIjoyMDkyMTIzMTA1fQ.peCHPjJdEwHrAZtcriMplSTx-JbQApB4pek0Vuxplc8` |
| Schema aplicado em | 19/04/2026 (via SQL Editor manual) |
| Migration principal | `supabase/migrations/001_initial_schema.sql` |

### Tabelas existentes (prefixo `req_*`)
`req_tickets` · `req_ticket_items` · `req_profiles` · `req_departments`
`req_quotations` · `req_approvals` · `req_suppliers`
`req_audit_logs` · `req_notifications`
`req_tickets_view` (view) · `req_users_public` (view)

### MCP do Supabase
Configurado mas com **timeout frequente** neste projeto. Se `mcp__supabase__execute_sql` falhar com timeout, use o **SQL Editor do Supabase Dashboard** em vez disso. Ao rodar SQL no editor:
- Sempre abrir aba **nova e limpa** (botão `+`)
- Usar delimitadores nomeados (`$f1$`, `$f2$`) em vez de `$$` nas funções PL/pgSQL
- Evitar `DECLARE` com tipos compostos de tabela — usar `LANGUAGE sql` com CTEs quando possível
- Rodar funções complexas **uma por vez**

---

## 3. VPS Hostinger

| Campo | Valor |
|-------|-------|
| Servidor | `srv1510643.hstgr.cloud` |
| Painel | hpanel.hostinger.com |
| Projeto Docker | O vprequisições usa deploy via **SSH + docker compose** (não via Gerenciador Docker UI) |
| Diretório no VPS | `/docker/vprequisicoes/` (projeto Docker) |
| Repo no VPS | `/docker/vprequisicoes/repo/` (git clone) |
| Proxy reverso | Traefik (compartilhado com outros projetos no VPS) |
| Domínio final | `requisicoes.vpsistema.com` |

### ⚠️ ATENÇÃO — Dois projetos no mesmo VPS
| Projeto | Supabase | Domínio | Diretório VPS |
|---------|----------|---------|---------------|
| **vpSuprimentos** | `crvtpkrgjscssykyeqro` | `suprimentos.vpsistema.com` | `/docker/vpsuprimentos` |
| **vprequisições** | `jsnnjsjnqqcqynjncmvz` | `requisicoes.vpsistema.com` | `/opt/vprequisicoes` |

Não confundir os dois. O Gerenciador Docker da Hostinger UI mostra o `vpsuprimentos` — **ignorar para este projeto**.

### MCP do Hostinger
Disponível. Usar `mcp__hostinger-mcp__VPS_*` para operações no VPS quando necessário.

---

## 4. GitHub

| Campo | Valor |
|-------|-------|
| Repo | `verticalpartsIA/vprequisicoes` |
| MCP GitHub | Disponível via `mcp__github__*` |

### Secrets necessários no GitHub Actions
Configurar em: `Settings → Secrets and variables → Actions`

| Secret | Descrição |
|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jsnnjsjnqqcqynjncmvz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `NEXT_PUBLIC_APP_URL` | `https://requisicoes.vpsistema.com` |
| `VPS_HOST` | IP ou hostname do VPS Hostinger |
| `VPS_USER` | Usuário SSH (geralmente `root`) |
| `VPS_SSH_KEY` | Chave privada SSH (PEM) |
| `SUPABASE_DB_URL` | `postgresql://postgres:[senha]@...` (opcional — para migration via CI) |

---

## 5. Pipeline de CI/CD

### Fluxo completo
```
push feature/** → CI (testes unitários)
merge → main   → SDD Pre-Deploy (3 níveis) → Deploy automático via SSH
```

### Workflows
| Arquivo | Dispara em | O que faz |
|---------|-----------|-----------|
| `.github/workflows/ci.yml` | push em qualquer branch | TypeScript · ESLint · Vitest · Playwright |
| `.github/workflows/sdd-pre-deploy.yml` | push em main | BASE→MEIO→TOPO→DEPLOY |

### SDD Pre-Deploy (enforcement MILITAR)
1. **SETUP** — Aplica migration Supabase (`continue-on-error: true` — não bloqueia)
2. **BASE** — TypeScript zero erros + schema Supabase + Docker build
3. **MEIO** — Testes de integração API
4. **TOPO** — Playwright E2E smoke + módulos
5. **DEPLOY** — SSH no VPS: `git pull` + `docker compose up -d`

Deploy só roda se BASE + MEIO + TOPO passarem. **Zero bypass.**

### Deploy SSH (o que roda no VPS)
```bash
cd /opt/vprequisicoes
git pull origin main
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=...
# (demais vars)
EOF
docker compose --env-file .env.production down
docker compose --env-file .env.production build --no-cache
docker compose --env-file .env.production up -d
curl -sf http://localhost:3000/api/health
```

---

## 6. Testes

### Rodar localmente
```bash
npm test                    # Vitest unitários (24 suites, 102 tests)
npm run test:coverage       # Com cobertura
npm run test:integration    # Integração (precisa de vars Supabase)
npm run test:m5             # Módulo M5 Frete específico
npx playwright test         # E2E
```

### Estrutura de testes
| Tipo | Localização | Ambiente |
|------|-------------|---------|
| Unitários | `packages/**/__.tests__/*.test.ts` | node |
| Integração TSX | `**/*.integration.test.tsx` | jsdom |
| Integração TS | `**/*.integration.test.ts` | node |
| SDD/Supabase | `tests/sdd/**` | node (excluído do `npm test`) |
| E2E | `tests/e2e/**` | Playwright |

### Exclusões no `npm test`
Os seguintes **não rodam** com `npm test` (precisam de vars Supabase):
- `tests/sdd/**`
- `packages/core/db/__tests__/supabase-flow*`

---

## 7. Docker

### Build local
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://jsnnjsjnqqcqynjncmvz.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key> \
  --build-arg NEXT_PUBLIC_APP_URL=https://requisicoes.vpsistema.com \
  -t vprequisicoes:local .
```

### docker-compose.yml (raiz do projeto — usado no VPS)
Usa `build: .` + variáveis de ambiente. **Não usar o Gerenciador Docker UI da Hostinger** — esse UI não suporta `build:` e é para o projeto vpsuprimentos.

---

## 8. Módulos do Sistema

| Módulo | Slug | Rota |
|--------|------|------|
| M1 — Produtos | `M1_PRODUTOS` | `/products` |
| M2 — Viagens | `M2_VIAGENS` | `/travel` |
| M3 — Serviços | `M3_SERVICOS` | `/services` |
| M4 — Manutenção | `M4_MANUTENCAO` | `/maintenance` |
| M5 — Frete | `M5_FRETE` | `/freight` |
| M6 — Locação | `M6_LOCACAO` | `/rental` |

### Workflow de status dos tickets
```
DRAFT → SUBMITTED → QUOTING → PENDING_APPROVAL → APPROVED → PURCHASING
  → RECEIVING → IN_USE → RETURNED → RELEASED
  → RELEASING → RELEASED (digital)
  → CANCELLED (qualquer etapa)
```

---

## 9. Responsável

| Campo | Valor |
|-------|-------|
| Dono do projeto | Gelson Simões (gelsonsimoes@gmail.com) |
| Empresa | VerticalParts |
| Regra de GO/NO-GO | Gelson aprova antes de qualquer deploy em produção |
| Data de início do deploy | previsto segunda-feira (21/04/2026) |

---

## 10. Bloco de contexto rápido — copie e cole no início de qualquer sessão futura

```
Projeto: VPRequisições
Repo: https://github.com/verticalpartsIA/vprequisicoes (branch main)
Local: C:\Users\gelso\Projetos_Sites\vprequisições_pai\vprequisições

SUPABASE (vprequisições — NÃO confundir com vpsuprimentos):
  URL: https://jsnnjsjnqqcqynjncmvz.supabase.co
  Anon: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbm5qc2pucXFjcXluam5jbXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDcxMDUsImV4cCI6MjA5MjEyMzEwNX0.xzt0F0DHe9_H7lN4qT3vmiEHNIjUPJ3ulhUiD7fB9C0
  Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbm5qc2pucXFjcXluam5jbXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0NzEwNSwiZXhwIjoyMDkyMTIzMTA1fQ.peCHPjJdEwHrAZtcriMplSTx-JbQApB4pek0Vuxplc8
  Schema: 100% aplicado em 19/04/2026. Tabelas: req_tickets, req_profiles, req_departments,
          req_ticket_items, req_quotations, req_approvals, req_suppliers, req_audit_logs,
          req_notifications + 2 views.

VPS HOSTINGER:
  IP: 72.61.48.156
  VM ID: 1510643
  Template: Ubuntu 24.04 com Docker + Traefik
  Projeto Docker: /docker/vprequisicoes/
  Repo no VPS: /docker/vprequisicoes/repo/
  Domínio: requisicoes.vpsistema.com
  Traefik: projeto "traefik" no Docker Manager, proxy network "proxy"

ATENÇÃO — vpsuprimentos é OUTRO projeto:
  Supabase: crvtpkrgjscssykyeqro | Domínio: suprimentos.vpsistema.com

DEPLOY:
  Pipeline: .github/workflows/sdd-pre-deploy.yml (BASE→MEIO→TOPO→DEPLOY via SSH)
  Deploy SSH: git clone/pull em /docker/vprequisicoes/repo + docker compose up
  GitHub Secrets necessários: VPS_HOST, VPS_USER, VPS_SSH_KEY,
    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL

TESTES:
  npm test → 24 suites, 102 tests (todos verdes em 19/04/2026)
  Excluídos do npm test: tests/sdd/** e supabase-flow* (precisam de vars Supabase)
```

---

## 11. Pendências conhecidas

### 🚨 CRÍTICO — App não funciona (dados somem após submit)
- [ ] **`src/lib/api/client.mock.ts` linha 14: `USE_MOCK = true`** — MUDAR PARA FALSE
- [ ] **Criar `src/app/api/requests/route.ts`** — GET lista tickets, POST cria ticket no Supabase
- [ ] **Criar `src/app/api/requests/[id]/route.ts`** — GET detalhe do ticket
- [ ] Testar fluxo: criar → ver na lista → avançar status

### Pipeline / Deploy
- [ ] Verificar se TOPO E2E passou e deploy rodou (run `24641602829`)
- [ ] Playwright auth tests precisam de `TEST_REQUESTER_EMAIL` + `TEST_REQUESTER_PASSWORD` secrets
- [ ] `tests/sdd/BASE_001` e `MEIO_001` têm `continue-on-error` (vitest ignora --config)

### Resolvido em 19/04/2026
- [x] GitHub Secrets configurados (8 secrets)
- [x] Schema Supabase aplicado (11 tabelas req_*)
- [x] SDD YAML corrigido (heredoc quebrando parser)
- [x] handlers.ts corrigido (id numérico, status uppercase)
- [x] 102/102 testes unitários passando
- [x] MEIO SDD pipeline passou
- [x] Token com workflow scope: `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`
