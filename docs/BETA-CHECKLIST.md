# CodeQuest Academy - Beta Checklist

## Objetivo

Validar o app como MVP premium antes de abrir beta externo. Testar em Android real, iPhone real e Expo Go mais recente.

## Preparacao

- Instalar dependencias com `npm install`.
- Rodar `npm run audit:content`.
- Rodar `npm run lint`.
- Rodar `npm run typecheck`.
- Rodar `npx expo-doctor`.
- Subir `npx expo start --localhost`.
- Testar com Supabase configurado e sem Supabase configurado.
- Testar com `EXPO_PUBLIC_AI_TUTOR_ENDPOINT` vazio para validar mock do Professor Byte.

## Fluxo Completo

1. Abrir app pela primeira vez.
2. Completar onboarding.
3. Conferir Home: proximo passo, streak, campanha, academia, arena, revisao e Professor Byte.
4. Entrar na Campanha.
5. Escolher trilha.
6. Abrir capitulo.
7. Concluir missao.
8. Simular erro e confirmar envio ao Laboratorio de Revisao.
9. Abrir Academia Dev.
10. Abrir aula.
11. Responder desafio rapido.
12. Abrir Arena de Codigo.
13. Filtrar linguagem e dificuldade.
14. Resolver desafio.
15. Abrir Professor Byte e testar sugestoes rapidas.
16. Abrir Perfil e conferir XP, moedas, progresso, analytics e conquistas.
17. Abrir Ranking offline.
18. Abrir Premium e confirmar que e vitrine sem pagamento real.
19. Abrir Loja e validar compras locais.
20. Abrir Configuracoes e alternar tema claro/escuro.

## Cadastro, Login e Sync

- Sem `.env`: Login deve mostrar aviso amigavel e app nao deve quebrar.
- Com Supabase: criar conta com email/senha.
- Fazer login.
- Abrir Conta e confirmar sync automatico.
- Tocar em `Sincronizar agora`.
- Conferir `profiles`, `cloud_progress` e `leaderboard_entries` no Supabase.
- Fazer logout.
- Entrar novamente e validar sessao.

## Ranking

- Deslogado: ranking local aparece.
- Logado: ranking online aparece.
- Ranking vazio: empty state aparece.
- Falha de rede: erro amigavel aparece.
- Confirmar que ranking nao expoe dados privados.

## Professor Byte

- Sem endpoint: mostrar `Modo Professor Byte offline`.
- Testar sugestoes rapidas.
- Enviar pergunta livre.
- Limpar conversa.
- Abrir Professor Byte pela Revisao, Arena, Academia e Campanha.
- Com endpoint real: confirmar resposta remota e fallback para mock quando endpoint falhar.

## Offline

- Abrir app sem internet.
- Concluir aula/desafio localmente.
- Confirmar que progresso local salva.
- Abrir Login/Conta e validar mensagens sem crash.
- Voltar online e sincronizar manualmente.

## Online

- Validar Supabase auth.
- Validar sync.
- Validar ranking.
- Validar Professor Byte remoto se configurado.

## UI e Acessibilidade

- Verificar contraste nos temas claro e escuro.
- Conferir toque minimo em botoes.
- Confirmar textos sem corte em telas pequenas.
- Conferir listas longas sem travamento.
- Validar safe area em iPhone.
- Validar Android com fonte aumentada.
- Confirmar que botoes em linhas quebram corretamente em telas estreitas.
- Conferir badges e icones sobre fundos coloridos em dark/light mode.
- Validar estados de loading, erro, sucesso, recompensa e offline.
- Confirmar que Home, Campanha, Academia, Arena e Revisao deixam claro o proximo passo.
- Conferir que Professor Byte soa como mentor, nao como mensagem generica.

## Art Direction QA

- Abrir Home, Onboarding, Campanha, Professor Byte, Academia, Arena, Revisao, Perfil, Loja, Premium, Ranking, Configuracoes, Conta, Login, Cadastro, Boss, Resultado, Missao, Aula e Desafio.
- Em cada tela, validar: hierarquia, CTA principal, leitura em 3 segundos, espacamento, contraste e consistencia de cards.
- Verificar que a paleta nao vira uma tela monocromatica.
- Garantir que nenhum placeholder visual pareca quebrado ou fora da identidade de tecnologia, aventura e evolucao.
- Revisar se recompensas de XP/moedas/streak aparecem perto da acao que as gerou.

## Bugs Conhecidos

- Ranking semanal ainda usa snapshot atual de XP.
- Sync usa heuristica de melhor progresso, nao merge campo a campo.
- Pagamento Premium e apenas vitrine.
- IA real depende de endpoint serverless externo.

## Itens Para Validar Antes Da Loja

- Icone final.
- Splash final.
- Politica de privacidade.
- Termos de uso.
- Fluxo de exclusao de conta.
- Recuperacao de senha.
- Testes em dispositivos reais de baixo desempenho.
- Revisao de conteudo educacional por especialista.
