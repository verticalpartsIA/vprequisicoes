# vprequisições v2

Sistema modular unificado para gestão de requisições, cotações e compras.

## Estrutura do Projeto

- **apps/web**: Frontend Next.js 14 utilizando App Router.
- **packages/modules**: Lógica de negócio isolada por módulo (M1, Cotação, Aprovação, etc).
- **packages/core**: Serviços transversais (Auth, Workflow, Database).
- **src/components**: Componentes UI reutilizáveis seguindo o padrão Shadcn.

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Tokens do Legado
- **Formulários**: React Hook Form + Zod
- **Banco de Dados**: Prisma (MySQL)
- **Estado**: Zustand + Server Actions

## Como Iniciar

1. Instalar dependências: `npm install`
2. Rodar em desenvolvimento: `npm run dev`
3. Gerar cliente Prisma: `npx prisma generate`

## Fluxo de Trabalho

`Requisição → Cotação → Aprovação → Compras → Recebimento`
