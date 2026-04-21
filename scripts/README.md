# 🛠️ Scripts de Diagnóstico e Correção

Conjunto de ferramentas para garantir a saúde do sistema **VPRequisições**.

## 🚀 Como usar o Verificador de Produção (Windows)

Este script valida suas variáveis de ambiente e testa a conexão real com o Supabase usando sua `SERVICE_ROLE_KEY`.

1. Abra o PowerShell na raiz do projeto.
2. Execute:
   ```powershell
   powershell -File scripts/fix-production.ps1
   ```
3. Observe o output:
   - **Verde (✅)**: Tudo pronto para o deploy na Vercel.
   - **Vermelho (❌)**: Algo está errado no `.env.local` ou no banco.

## 📄 Arquivos incluídos:

- `fix-production.ps1`: Script principal para ambiente Windows.
- `test-supabase.ts`: Teste de conexão simples via `tsx`.
- `fix-report-YYYYMMDD.log`: Logs gerados a cada execução (criados automaticamente).

---
*Mantenha seu `.env.local` sempre atualizado e nunca suba as chaves reais para o GitHub.*
