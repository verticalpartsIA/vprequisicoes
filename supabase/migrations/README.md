# Supabase Migrations

This directory contains the SQL migration files for the VPRequisições database.

## Order of Execution

Migrations are applied in filename order. Convention: `YYYYMMDD_NNN_description.sql`

## Planned Tables (from `packages/core/database/schema.prisma`)

| Table | Description |
|---|---|
| `users` | Sistema de usuários e roles |
| `tickets` | Todas as requisições (M1–M6) |
| `ticket_items` | Itens individuais de cada ticket |
| `quotations` | Cotações por ticket |
| `quotation_suppliers` | Fornecedores por item cotado |
| `purchase_orders` | Ordens de Compra geradas |
| `receiving_logs` | Logs de recebimento físico/digital |
| `audit_logs` | Trilha de auditoria de workflow |

## Next Steps

1. Create your Supabase project at https://app.supabase.com
2. Copy the project URL and anon key to `.env.local`
3. Run `npx supabase db push` to apply migrations
4. Replace `@/lib/api/client.mock` calls with Supabase client

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server-side only
```
