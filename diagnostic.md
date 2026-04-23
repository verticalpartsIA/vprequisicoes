# Diagnóstico de Conexão Supabase - VP REQUISIÇÕES

## 1. Status das Variáveis de Ambiente (.env.local)
- **NEXT_PUBLIC_SUPABASE_URL**: ✅ Configurado (`https://jsnnjsjnqqcqynjncmvz.supabase.co`)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: ✅ Configurado
- **SUPABASE_SERVICE_ROLE_KEY**: ✅ Configurado
- **NEXT_PUBLIC_USE_MOCK**: `false` (O sistema está tentando usar a conexão real)

## 2. Resultado do Teste de Conexão
> [!WARNING]
> **Erro de Ambiente**: Devido a uma restrição técnica no ambiente de execução (falta de suporte a sandbox no Windows), não foi possível rodar o script `scripts/test-supabase.ts` diretamente através do agente.
> No entanto, a configuração foi validada visualmente e coincide com os registros oficiais em `02_TOKENS_API_AGENTES.txt`.

## 3. RLS Policies (Tabela: req_tickets)
Extraído de `supabase/migrations/001_initial_schema.sql`:

| Operação | Nome da Policy | Condição (USING / WITH CHECK) |
| :--- | :--- | :--- |
| **SELECT** | `tickets_select` | `requester_id = auth.uid() OR role IN ('quoter','approver','buyer','receiver','admin')` |
| **INSERT** | `tickets_insert` | `requester_id = auth.uid()` |
| **UPDATE** | `tickets_update` | `role IN ('approver','buyer','receiver','admin')` |

### Observação Crítica sobre RLS:
A policy de **SELECT** exige que o usuário esteja autenticado (`auth.uid()`) ou possua um papel específico. Se o MCP ou scripts estiverem usando a `ANON_KEY` sem uma sessão de usuário ativa, as consultas retornarão vazio ou erro de permissão.

## 4. Recomendações de Correção

1. **Uso de Service Role**: Para ferramentas de diagnóstico, MCP e scripts de automação, utilize sempre a `SUPABASE_SERVICE_ROLE_KEY`. Ela ignora o RLS e permite acesso total ao banco.
2. **Configuração do MCP**: Verifique se o `mcp_config.json` está apontando para o binário correto e se as variáveis de ambiente estão sendo passadas sem aspas extras que possam corromper o JWT.
3. **Teste Manual**: Recomendo rodar manualmente o comando abaixo no seu terminal para confirmar a conectividade final:
   ```powershell
   npx -y tsx scripts/test-supabase.ts
   ```

---
*Relatório gerado automaticamente em 21/04/2026*
