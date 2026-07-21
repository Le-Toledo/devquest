# Auditoria de Exclusão de Conta - Code Quest

Data da revisão local: 2026-07-18

Status: preparado localmente, mas não implantado nem testado remotamente.

Revisão remota somente leitura em 2026-07-18:

- Projeto `urksgruekgtwnnlhsroz` está `ACTIVE_HEALTHY`.
- No schema `public`, existe somente `player_progress`.
- `profiles`, `leaderboard_entries` e `feedback_reports` não existem no remoto.
- `player_progress.user_id` é primary key e possui foreign key validada para `auth.users(id)`.
- `player_progress_user_id_fkey` está validada e configurada com `ON DELETE CASCADE`.
- `player_progress` possui 2 registros no remoto e 0 registros órfãos nesta revisão.

## Fluxo esperado

1. O app exige usuário autenticado.
2. O usuário digita `EXCLUIR`.
3. O cliente chama a Edge Function `delete-account` com Bearer token da sessão atual.
4. A função valida o JWT com Supabase Auth.
5. A função usa apenas `userData.user.id` como dono da operação.
6. A função remove o usuário em Supabase Auth.
7. O cascade remove `player_progress` automaticamente.
8. O app limpa progresso local apenas após sucesso remoto.
9. O app encerra a sessão local e retorna à autenticação.

## Matriz de dados vinculados ao usuário

| Tabela/recurso | Chave de vínculo | RLS esperado | Comportamento na exclusão | Cascade existente no schema local | Exclusão manual na função | Risco |
| --- | --- | --- | --- | --- | --- | --- |
| `auth.users` | `id` | Gerenciado pelo Supabase Auth | Removido por `auth.admin.deleteUser(userId)` | Não se aplica | Sim, etapa final | Alto se função não for implantada/testada |
| `public.profiles` | `id` esperado | Não existe no remoto | Não aplicável | Ausente no remoto | Não | Baixo: não tentar deletar tabela ausente |
| `public.player_progress` | `user_id` | Dono lê/insere/atualiza | Removido automaticamente ao apagar Auth | `player_progress_user_id_fkey` com `ON DELETE CASCADE` | Não | Baixo: depende da FK validada no remoto |
| `public.leaderboard_entries` | `user_id` esperado | Não existe no remoto | Não aplicável | Ausente no remoto | Não | Baixo: não tentar deletar tabela ausente |
| `public.feedback_reports` | `user_id` esperado | Não existe no remoto | Não aplicável | Ausente no remoto | Não | Baixo: não tentar deletar tabela ausente |
| AsyncStorage local | Chaves `@codequest/*` | Local no aparelho | Limpo após sucesso remoto | Não se aplica | Sim via `resetProgress()` | Baixo; confirmar em QA físico |
| Professor Byte/OpenRouter | Prompt enviado via Edge Function | Sem tabela local identificada | Não há registro persistente no cliente | Não se aplica | Não | Médio: confirmar logs remotos sem prompt completo |
| Supabase Storage | Nenhum bucket de usuário identificado | Não se aplica | Nada a remover no estado atual | Não se aplica | Não | Baixo, salvo se storage for adicionado depois |

## Auditoria da Edge Function local

Arquivo: `supabase/functions/delete-account/index.ts`

- Aceita `OPTIONS` para CORS.
- Aceita apenas `POST`.
- Exige header `Authorization: Bearer ...`.
- Valida o token com `userClient.auth.getUser()`.
- Não confia em `user_id` recebido pelo body.
- Exige confirmação `EXCLUIR`.
- Usa `SUPABASE_SERVICE_ROLE_KEY` somente dentro da Edge Function.
- Não remove `player_progress` explicitamente; confia na FK remota validada com `ON DELETE CASCADE`.
- Não tenta remover `leaderboard_entries`, `feedback_reports` ou `profiles` enquanto essas tabelas estiverem ausentes no remoto.
- Apaga o usuário com `adminClient.auth.admin.deleteUser(userId)`.
- Não registra token, e-mail, prompt ou dados pessoais.
- Retorna mensagens genéricas em falhas internas.

## Riscos antes do deploy

- `delete-account` ainda não existe no projeto remoto identificado.
- O schema remoto foi inspecionado por metadados e contagens; só existe `public.player_progress` no schema `public`.
- `feedback_reports`, `leaderboard_entries` e `profiles` não existem remotamente nesta revisão.
- `player_progress` possui FK/cascade validada para `auth.users`; a função local foi ajustada para usar `admin.deleteUser` como operação destrutiva principal.
- A exclusão parcial precisa ser testada com conta descartável.
- A função `professor-byte-ai` remota aparece com `verify_jwt: false`; o código valida JWT internamente, mas recomenda-se avaliar `verify_jwt` antes da submissão.

## Gate antes do deploy

Antes de implantar `delete-account`, confirmar explicitamente:

- project-ref: `urksgruekgtwnnlhsroz`;
- função: `delete-account`;
- arquivos enviados: `supabase/functions/delete-account/index.ts`;
- secrets remotos existentes: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`;
- tabelas confirmadas no remoto: `player_progress`;
- constraint confirmada no remoto: `player_progress_user_id_fkey` (`FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`);
- plano de teste com conta descartável;
- plano de rollback: remover/desabilitar a função e manter UI exibindo bloqueio amigável.

Nenhum deploy foi executado nesta revisão.
