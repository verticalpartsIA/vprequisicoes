# 📦 Manifesto de Deploy VPRequisições (Espelho do Backup Funcional)

Para o site rodar com sucesso na Hostinger, a pasta `out` (e o ZIP) deve conter exatamente esta estrutura de arquivos e pastas:

## 📂 Pastas (Módulos e Sistema)
1.  **`_next/`**: (Obrigatório) Contém o CSS, JS e fontes.
2.  **`404/`**: Pasta da página de erro.
3.  **`_not-found/`**: Pasta de fallback.
4.  **`approval/`**: Módulo de Aprovações.
5.  **`auth/`**: Módulo de Autenticação.
6.  **`dashboard/`**: Painel BI.
7.  **`freight/`**: Módulo de Fretes.
8.  **`login/`**: Tela de Login.
9.  **`logs/`**: Histórico do sistema.
10. **`maintenance/`**: Módulo de Manutenção.
11. **`products/`**: Módulo de Produtos.
12. **`purchasing/`**: Módulo de Compras.
13. **`quotation/`**: Módulo de Cotação (O que estamos ajustando).
14. **`receiving/`**: Módulo de Recebimento.
15. **`rental/`**: Módulo de Locação.
16. **`services/`**: Módulo de Serviços.
17. **`travel/`**: Módulo de Viagens.

## 📄 Arquivos (Raiz)
- **`.htaccess`**: Essencial para Hostinger (Configuração de Rotas).
- **`index.html`**: Página de entrada do Dashboard.
- **`index.txt`**: Metadados do Next.js.
- **`404.html`**: Página de erro 404.
- **`favicon.ico`**: Ícone do navegador.
- **`.gitkeep`**: Arquivo de controle.

## 📄 Arquivos de Dados (__next)
- `__next.__PAGE__.txt`
- `__next._full.txt`
- `__next._head.txt`
- `__next._index.txt`
- `__next._tree.txt`

---

### 💡 Verificação Rápida
Se o seu build não gerar as pastas acima (como `maintenance`, `freight`, etc.), o site estará incompleto. Garante que todas essas pastas existam na `out` antes de subir.
