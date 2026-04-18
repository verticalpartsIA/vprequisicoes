# Spec: E2E Approval Module

## Etapa 1 — Ambiente
- Verificar servidor em http://localhost:3000
- Status 200

## Etapa 2 — Navegação
- Acessar /approval
- Validar carregamento da lista

## Etapa 3 — Ticket
- Buscar M1-0123
- Validar: valor R$ 110,00 e Tier 1

## Etapa 4 — Análise
- Clicar "Analisar"
- Validar: fornecedor vencedor 'Parafusos Brasil' e timeline

## Etapa 5 — Aprovação
- Selecionar "Aprovar"
- Confirmar no modal
- Validar: botão habilitado (alçada OK)

## Etapa 6 — Resultado
- Validar Toast e Status: APPROVED

## Etapa 7 — Lista
- Validar: ticket saiu da lista de pendentes

## Regras de Negócio
- Bloquear aprovação sem cotação
- Bloquear aprovação acima da alçada
- Bloquear reprovação sem motivo (min 10)
- Bloquear revisão sem comentário (min 5)
- Registrar Auditoria
