# Contrato da API Legada - vprequisições

**Endpoint Base:** `https://cyan-partridge-132677.hostingersite.com/api/api.php`
**Autenticação:** Bearer Token (JWT customizado)

## Endpoints

| Ação (`?action=`) | Método | Parâmetros (JSON/Form) | Descrição |
| :--- | :--- | :--- | :--- |
| `login` | POST | `{username, password}` | Autentica usuário e retorna token. |
| `add_user` | POST | `{username, password, role}` | Cria novo usuário (Admin apenas). |
| `list_users` | GET | - | Lista usuários cadastrados (Admin apenas). |
| `delete_user` | DELETE | `?username=...` | Remove um usuário (Admin apenas). |
| `create_request` | POST | `FormData` {type, details, main_file} | Cria uma nova solicitação. |
| `list_requests` | GET | - | Lista todas as solicitações (Admin vê todas, User vê as suas). |
| `update_status` | POST | `{id, status}` | Atualiza status (Aprovado/Reprovado/Arquivado). |
| `update_details` | POST | `{id, details}` | Edita os dados (JSON) de uma solicitação. |
| `delete_request` | POST | `{id}` | Exclui permanentemente uma solicitação. |

## Estrutura de Resposta (Sucesso)
```json
{ "ok": true }
// ou
{ "username": "...", "role": "...", "token": "..." }
// ou
{ "requests": [...] }
```

## Estrutura de Resposta (Erro)
```json
{ "error": "Mensagem de erro" }
```
