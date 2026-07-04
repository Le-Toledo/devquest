# CodeQuest Academy

MVP premium de jogo educacional em React Native com Expo SDK 54 e TypeScript. O app ensina programacao por campanha RPG, quizzes, Arena de Codigo, Academia Dev, Laboratorio de Revisao, XP, moedas, conquistas, loja, streak, premium simulado e progresso persistido.

## Como rodar

```bash
npm install
npx expo start
```

Depois abra no Expo Go pelo QR Code. Para web:

```bash
npx expo start --web
```

## Estrutura

```text
src/
  assets/       Estrutura para artes finais, sons, fundos, badges e icones
  components/   UI reutilizavel: cards, botoes, progresso, dialogos e campanha
  screens/      Home, mapa, quiz, campanha, perfil, ranking, loja, carreira, settings
  data/         Perguntas, mundos, campanha, personagens, loja, missoes e dicas
  hooks/        Estado global de jogador e tema
  services/     Persistencia com AsyncStorage
  types/        Tipos TypeScript do dominio
  navigation/   Navegacao simples por estado
  theme/        Paletas claro/escuro
  utils/        Regras de progressao
```

## Design System

O design system fica em `src/theme/`:

- `colors.ts`: paletas claro/escuro e estados
- `spacing.ts`: espacamentos e radius
- `typography.ts`: escala tipografica
- `shadows.ts`: sombras e glow
- `gradients.ts`: fundos premium
- `animations.ts`: duracoes e parametros de microinteracao
- `index.ts`: barrel export

Componentes premium em `src/components/ui/`:

- `AppButton`
- `AppCard`
- `AppScreen`
- `AppHeader`
- `ProgressBar`
- `StatBadge`
- `SectionTitle`
- `EmptyState`
- `LoadingState`
- `XPBadge`
- `CoinBadge`
- `LevelBadge`
- `GradientBackground`
- `FloatingActionCard`
- `GameToast`

Os componentes antigos `GameButton`, `GameCard` e `GradientScreen` tambem usam os novos tokens, entao as telas existentes ganham consistencia visual sem mudar regra de negocio. A camada visual deve ser evoluida nesses componentes primeiro; estilos locais em telas ficam reservados para composicao especifica.

## Guia Visual

CodeQuest Academy deve parecer um RPG educacional premium: tecnologia, aventura, progresso e mentoria. A interface prioriza clareza acima de decoracao e evita depender de uma unica familia de cor.

Principios visuais:

- Uma acao principal por bloco.
- Cards com borda sutil, sombra controlada e radius consistente.
- Cores semanticas: verde para progresso, azul/violeta para pratica, amarelo para recompensa, vermelho para erro.
- Texto curto, humano e orientado ao proximo passo.
- Feedback sempre visivel para progresso, recompensa, erro, loading e sync.
- Botao primario reservado para a acao mais importante da tela.
- Tema claro e escuro precisam manter contraste e legibilidade.
- Badges, icones e estados selecionados devem usar `colors.onAccent` para preservar contraste em dark/light mode.
- Fundos podem ter profundidade, mas sem elementos decorativos que chamem mais atencao que a tarefa.

## Principios de UX

- O jogador deve entender onde esta nos primeiros 3 segundos.
- Toda tela precisa responder: "o que faco agora?"
- Erro vira aprendizado, nao punicao.
- Recompensa deve aparecer perto da acao que a gerou.
- Funcionalidade offline nunca deve parecer falha.
- IA e nuvem sao melhorias, nao dependencias para jogar.

## Arquitetura Visual

- `src/theme`: tokens de cor, tipografia, espacamento, sombras, radius e gradientes.
- `GameButton`: interacao, loading, acessibilidade e hierarquia de CTA.
- `GameCard`: superficie padrao para agrupamento visual.
- `GradientScreen`: fundo premium com safe area.
- `ProgressBar`: progresso com acessibilidade.
- Telas devem compor esses blocos antes de criar estilos locais novos.
- `colors.onAccent`: texto/icone sobre superficies de recompensa, sucesso, erro ou primaria.

## Como Manter Consistencia

1. Use tokens de `src/theme` antes de criar valores novos.
2. Evite novos tons fora da paleta sem motivo claro.
3. Prefira copy curta com verbo de acao.
4. Mantenha touch targets com pelo menos 48px de altura.
5. Use `FlatList` para listas longas.
6. Teste tema claro e escuro antes de finalizar.
7. Registre decisoes grandes em `docs/ADR-*`.
8. Atualize `docs/BETA-CHECKLIST.md` quando o fluxo mudar.

## Assets

A estrutura de assets temporarios esta preparada:

```text
src/assets/
  characters/
  bosses/
  avatars/
  badges/
  backgrounds/
  icons/
  sounds/
```

O arquivo `src/data/assetRegistry.ts` centraliza placeholders de Professor Byte, bugs, bosses, avatares, medalhas, fundos, icones de linguagens e sons. Para trocar por artes finais, adicione os arquivos nas pastas e substitua os placeholders no registro.

## Som

`src/services/soundService.ts` prepara os eventos:

- `playClick`
- `playSuccess`
- `playError`
- `playLevelUp`
- `playReward`
- `playBoss`
- `playVictory`
- `playDefeat`
- `setSoundEnabled`
- `getSoundSettings`

Hoje o servico usa placeholders seguros, sem dependencia extra. A tela de Configuracoes ja permite ligar/desligar som.

## Modo Campanha

O modo campanha se chama `A Jornada do Desenvolvedor`. Ele transforma o jogo em um RPG educacional leve com Professor Byte, dialogos, escolha de trilha, capitulos, missoes, bosses e recompensas.

Arquivos principais:

- `src/data/campaignChapters.ts`: capitulos da jornada
- `src/data/campaignMissions.ts`: 30 missoes narrativas
- `src/data/campaignBosses.ts`: bosses de cada capitulo
- `src/data/characters.ts`: Professor Byte, bugs, rivais e chefes
- `src/data/mentorDialogues.ts`: falas e sequencias de dialogo
- `src/services/campaignProgressService.ts`: progresso salvo em AsyncStorage
- `src/screens/CampaignScreen.tsx`: mapa, trilhas, capitulos e missoes
- `src/screens/CampaignIntroScreen.tsx`: introducao pulavel
- `src/screens/MissionResultScreen.tsx`: vitoria, derrota e bau
- `src/screens/BossIntroScreen.tsx`: introducao de batalha contra boss

## Laboratorio de Revisao

O Laboratorio de Revisao e a area onde o Professor Byte transforma erros em treino inteligente. Quando o jogador erra uma pergunta de quiz ou falha uma missao da campanha, o erro e salvo no AsyncStorage com:

- Pergunta ou missao
- Linguagem/area
- Conceito
- Nivel
- Resposta escolhida
- Resposta correta
- Explicacao
- Dica
- Quantidade de erros
- Proxima data de revisao

Arquivos principais:

- `src/types/review.ts`: tipos de erro, prioridade e estatisticas
- `src/services/reviewService.ts`: persistencia, repeticao espacada e estatisticas
- `src/data/reviewLessons.ts`: mini-aulas do Professor Byte por linguagem
- `src/components/ErrorReviewCard.tsx`: card de erro salvo
- `src/components/MentorExplanation.tsx`: explicacao didatica do Professor Byte
- `src/screens/ReviewLabScreen.tsx`: tela do laboratorio

Prioridades de repeticao espacada:

- Revisar hoje
- Revisar amanha
- Revisar em 3 dias
- Revisar em 7 dias

Quando o jogador acerta uma revisao, o intervalo aumenta e ele recebe XP/moedas. Quando erra, o intervalo volta para hoje e a explicacao fica mais simples. O jogador tambem pode marcar um erro como aprendido.

Conquistas de revisao:

- Aprendi com o Bug
- Revisao Perfeita
- 10 Erros Corrigidos
- Mestre da Persistencia
- Nunca Desisto

Como testar:

1. Rode `npx expo start`
2. Erre uma pergunta em qualquer fase ou use `Simular erro e revisar` em uma missao da campanha
3. Abra `Laboratorio de Revisao` pela Home, Perfil ou Campanha
4. Toque em `Revisar`
5. Marque `Acertei`, `Errei` ou `Marcar como aprendido`

## Academia Dev

A Academia Dev e a escola de programacao dentro do CodeQuest Academy. Ela foi estruturada como curso guiado, com trilhas, modulos e aulas completas. O objetivo e que o jogador consiga estudar de verdade antes de entrar em campanha, arena, revisao ou entrevista.

Estrutura atual:

- 17 trilhas
- 85 modulos
- 255 aulas completas
- 5 modulos por trilha
- 3 aulas por modulo
- 15 aulas por trilha

Trilhas:

- Logica de Programacao
- HTML
- CSS
- JavaScript
- TypeScript
- React
- React Native
- Node.js
- APIs REST
- SQL
- Git e GitHub
- Python
- Java
- Kotlin
- C#
- Carreira Dev
- Entrevista Tecnica

Arquivos principais:

- `src/types/academy.ts`: tipos de trilha, aula, desafio rapido e progresso
- `src/data/learningPaths.ts`: trilhas da Academia Dev
- `src/data/lessons.ts`: modulos e aulas completas da Academia
- `src/services/academyProgressService.ts`: progresso salvo em AsyncStorage
- `src/components/LearningPathCard.tsx`: card de trilha
- `src/components/LessonCard.tsx`: card de aula
- `src/components/CodeBlock.tsx`: bloco de codigo
- `src/components/QuickChallenge.tsx`: desafio rapido da aula
- `src/screens/AcademyScreen.tsx`: lista de trilhas e aulas
- `src/screens/LessonScreen.tsx`: leitura da aula, dica e desafio
- `scripts/auditAcademyContent.ts`: auditoria de qualidade da Academia

Cada aula possui:

- Titulo
- Descricao
- Objetivo da aula
- Explicacao completa
- Secoes internas
- Exemplo pratico
- Bloco de codigo quando faz sentido
- Erros comuns
- Boas praticas
- Dica do Professor Byte
- Resumo final
- Exercicio rapido
- Pergunta de fixacao com 4 alternativas
- Resposta correta e explicacao
- Tempo estimado
- Nivel
- Pre-requisitos
- Tags
- XP e moedas
- Status de conclusao

Quando o jogador erra o desafio rapido, o erro e enviado para o Laboratorio de Revisao.

### Como adicionar modulos

Cada trilha deve manter pelo menos 5 modulos. Um modulo precisa ter:

- `id` estavel no formato `<pathId>-<slug>`
- `pathId` apontando para uma trilha existente
- `title`
- `description`
- `order`

Os modulos atuais sao gerados em `src/data/lessons.ts` a partir de especificacoes curriculares. Ao adicionar novos modulos, mantenha o agrupamento por trilha e rode a auditoria da Academia.

### Como adicionar aulas completas

Uma aula deve ensinar um conceito concreto. Evite textos genericos como "X e usado para programar". A aula precisa responder:

- O que e o conceito
- Por que existe
- Quando usar
- Como funciona
- Exemplo real
- Erro comum
- Boa pratica
- Como aparece no mercado
- Como praticar

Padrao de ID:

```text
<pathId>-<moduleSlug>-<topicSlug>
```

Exemplos:

```text
kotlin-path-fundamentos-null-safety
sql-path-fundamentos-select
react-path-qualidade-effect
```

### Auditoria da Academia

Rode:

```bash
npm run audit:academy
```

O auditor verifica:

- quantidade minima de trilhas, modulos e aulas
- pelo menos 5 modulos por trilha
- pelo menos 3 aulas por modulo
- pelo menos 15 aulas por trilha
- IDs duplicados
- titulos duplicados dentro da mesma trilha
- aulas sem objetivo, conteudo, resumo, tags ou desafio
- resposta correta invalida
- ausencia de codigo em trilhas tecnicas
- niveis invalidos
- conteudo curto demais

Critério de qualidade: uma aula deve ter conteudo suficiente para o aluno sair com uma decisao pratica nova, nao apenas uma definicao curta.

## Como adicionar trilhas

Adicione um item em `src/data/learningPaths.ts`:

```ts
{
  id: 'security-path',
  title: 'Seguranca Web',
  description: 'Fundamentos de seguranca para apps reais.',
  icon: 'shield-checkmark',
  recommendedLevel: 5,
  areaIds: ['rest', 'node'],
  color: '#43d9ad'
}
```

## Como adicionar aulas

Adicione uma aula em `src/data/lessons.ts` apontando para uma trilha e modulo existentes. O formato atual usa especificacoes curriculares para gerar aulas completas com seções, desafio e auditoria.

Campos obrigatorios de qualidade:

- `title`
- `description`
- `objective`
- `content`
- `sections`
- `commonMistakes`
- `bestPractices`
- `professorTip`
- `summary`
- `challenge`
- `estimatedMinutes`
- `level`
- `tags`

Exemplo conceitual:

```ts
topic(
  'input-validation',
  'Validacao de entrada',
  'Validacao',
  'Validar dados externos antes de aplicar regra de negocio.',
  'if (!input.email.includes("@")) throw new Error("invalid");',
  'Validacao protege o sistema contra dados incompletos, maliciosos ou fora do contrato.',
  'Use validacao na borda da API, antes de salvar ou processar.',
  'Confiar em dados vindos do usuario sem verificar formato.',
  'Valide cedo, retorne erro claro e nao exponha detalhes internos.',
  'Validar entrada antes de processar'
)
```

## Como conectar aulas com campanha

A campanha usa `recommendedLessonFor(areaId, concept)` em `src/data/lessons.ts`. Para melhorar recomendacoes, use `areaId` e `concept` nas missoes de campanha de forma parecida com as aulas.

## Como testar a Academia

1. Rode `npx expo start`
2. Abra `Academia Dev` pela Home, Perfil ou Campanha
3. Escolha uma trilha
4. Abra uma aula
5. Leia o conteudo e responda o desafio rapido
6. Confira XP, moedas, progresso no Perfil e erros no Laboratorio de Revisao

## Arena de Codigo

A Arena de Codigo oferece desafios praticos simulados, sem executar codigo real. Ela treina leitura, depuracao e tomada de decisao em trechos de codigo.

Tipos de desafio:

- Completar codigo
- Encontrar bug
- Ordenar blocos
- Escolher melhor solucao
- Simular saida do codigo
- Refatorar codigo

Conteudo inicial:

- 15 JavaScript
- 10 TypeScript
- 10 Python
- 10 Java
- 10 Kotlin
- 10 SQL
- 8 HTML
- 7 CSS

Arquivos principais:

- `src/types/codeArena.ts`: tipos da arena
- `src/data/codeChallenges.ts`: 80 desafios iniciais
- `src/services/codeArenaService.ts`: progresso, combo e medalhas
- `src/components/CodeEditorSimulated.tsx`: editor visual com linhas numeradas
- `src/components/CodeChallengeCard.tsx`: card de desafio
- `src/screens/CodeArenaScreen.tsx`: lista e filtros
- `src/screens/CodeChallengeScreen.tsx`: resolucao do desafio

Integrações:

- Erros da Arena vao para o Laboratorio de Revisao
- Campanha recomenda desafios relacionados
- Perfil mostra desafios concluidos, revisoes, combo e medalhas
- Academia sugere pratica relacionada ao tema estudado

Como testar:

1. Rode `npx expo start`
2. Abra `Arena de Codigo` pela Home
3. Filtre por linguagem ou nivel
4. Resolva um desafio
5. Confira recompensas, combo e erros enviados ao Laboratorio

## Polimento Comercial

O app possui uma camada de produto para apresentar o MVP com cara de jogo pronto para loja:

- Onboarding profissional
- Dashboard principal com recomendacoes
- Streak de estudo
- Recompensa diaria
- Tela Premium simulada
- Analytics local simples

Arquivos principais:

- `src/screens/OnboardingScreen.tsx`: boas-vindas, objetivo, trilha inicial e avatar
- `src/screens/DailyRewardScreen.tsx`: recompensa diaria de XP e moedas
- `src/screens/PremiumScreen.tsx`: planos Free/Premium e loja premium futura
- `src/components/HomeDashboard.tsx`: Home comercial com progresso e recomendacoes
- `src/components/StreakCard.tsx`: card de streak e XP do dia
- `src/components/RecommendedActionCard.tsx`: cards de missao, aula e desafio recomendados
- `src/services/streakService.ts`: streak, recompensa diaria e onboarding
- `src/services/localAnalyticsService.ts`: estatisticas locais de uso
- `src/types/monetization.ts`: tipos de onboarding e premium
- `src/data/premiumPlans.ts`: planos e catalogo premium futuro

## Onboarding

Na primeira abertura, o jogador escolhe:

- Objetivo: aprender do zero, praticar, entrevista ou carreira dev
- Trilha inicial: front-end, back-end, mobile, full stack ou carreira
- Avatar inicial

Essas escolhas sao salvas com AsyncStorage e podem ser usadas futuramente para personalizar recomendacoes.

## Streak e Recompensa Diaria

O streak registra dias seguidos de estudo. Atividades que dao XP tambem renovam o streak. A tela de recompensa diaria entrega XP/moedas uma vez por dia e reforca retencao.

## Premium Futuro

A tela Premium nao executa pagamento real. Ela prepara a apresentacao comercial para:

- Plano Free
- Plano Premium
- Loja premium
- Skins premium
- Temas premium
- Pacotes de desafios premium
- Revisao avancada
- Remocao futura de anuncios

## Analytics Local

O app salva localmente:

- Tempo estudado
- Aulas feitas
- Desafios feitos
- Campanha concluida
- Erros revisados
- Linguagem mais estudada
- Melhor sequencia/combo

Esses dados aparecem no Perfil e ajudam a validar engajamento sem depender de backend.

## Backend Supabase

O CodeQuest Academy agora possui uma base conectada com Supabase sem abandonar o comportamento offline. O app continua local-first com AsyncStorage, e a nuvem entra para autenticacao, sincronizacao de progresso e ranking online.

Arquivos principais:

- `src/services/supabaseClient.ts`: client Supabase com variaveis publicas do Expo
- `src/hooks/useAuth.tsx`: estado de sessao, login, cadastro e logout
- `src/services/syncService.ts`: sync local para nuvem com estrategia de melhor progresso
- `src/services/leaderboardService.ts`: ranking global, semanal e filtro por linguagem favorita
- `src/types/backend.ts`: contratos de perfil, progresso, ranking e status de sync
- `src/screens/LoginScreen.tsx`: tela unica de autenticacao com login, cadastro e recuperacao
- `src/screens/RegisterScreen.tsx`: tela legada mantida por compatibilidade interna
- `src/screens/AccountScreen.tsx`: status da nuvem, sync manual e resumo local
- `docs/supabase-schema.sql`: schema SQL com RLS e permissao publica minima do ranking
- `docs/ADR-002-Supabase.md`: decisao arquitetural do backend local-first

### Como configurar Supabase

1. Crie um projeto em Supabase.
2. Abra o SQL Editor.
3. Rode o conteudo de `docs/supabase-schema.sql`.
4. Copie a Project URL e a anon public key. O app tambem aceita a publishable key nova do Supabase (`sb_publishable_...`).
5. Crie um arquivo `.env` local baseado em `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Essas variaveis usam o prefixo `EXPO_PUBLIC_` porque rodam no app Expo. Nao coloque service role key, JWT secret, database password ou qualquer chave secreta no codigo. Se o `.env` estiver ausente ou ainda com placeholders, a tela de Entrar/Criar conta continua visivel, mas as acoes mostram erro amigavel e o Hub nao abre sem sessao real.

Valide a configuracao local sem imprimir segredo:

```bash
npm run check:supabase
```

Depois de alterar `.env`, reinicie o Expo limpando o cache para o bundle reler as variaveis:

```bash
npx expo start -c
```

### Autenticacao real

- Sem sessao Supabase valida, o app mostra a tela unica de `Entrar` e `Criar conta`.
- `signUp`, `signIn`, `signOut` e recuperacao de senha usam Supabase Auth real.
- O Hub so abre quando `supabase.auth.signInWithPassword` ou `supabase.auth.signUp` retornar uma sessao valida.
- Se o Supabase exigir confirmacao de email, o cadastro mostra a mensagem de confirmacao e nao entra no Hub ate existir sessao.
- `Dev Explorer` e progresso local sao apenas fallback visual/local; nao contam como usuario autenticado.

### EAS/TestFlight

O arquivo `eas.json` possui perfis `development`, `preview` e `production`. Para TestFlight, configure as mesmas variaveis no ambiente `production` do EAS antes do build.

Pelo EAS CLI atual, use ambientes:

```bash
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "URL_DO_SUPABASE" --visibility plain
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "ANON_KEY_OU_PUBLISHABLE_KEY_PUBLICA" --visibility sensitive
```

Se sua versao do EAS CLI ainda usa secrets por projeto, o equivalente e:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "URL_DO_SUPABASE"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "ANON_KEY_OU_PUBLISHABLE_KEY_PUBLICA"
```

Build iOS para TestFlight:

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Nao coloque `service_role_key` no EAS, no `.env`, no `app.json` ou no codigo. O app mobile deve usar somente chave publica anon/publishable com RLS ligado no Supabase.

### Como testar login

1. Rode `npm run check:supabase`.
2. Rode `npx expo start -c`.
3. Abra o app sem sessao.
4. Crie uma conta com nome, email, senha e confirmacao.
5. Se o Supabase criar sessao automaticamente, o Hub abre.
6. Se o Supabase exigir confirmacao de email, confirme o email e faca login.
7. Confira o usuario em Supabase Auth.
8. Faca logout e entre novamente com o mesmo email/senha.

Se o Supabase estiver configurado para exigir confirmacao de email, confirme o email antes de tentar login.

### Como testar sync

1. Ganhe XP, conclua uma aula ou resolva um desafio.
2. Abra `Conta e nuvem`.
3. Ao entrar na conta, a tela executa um sync automatico uma vez por usuario.
4. Toque em `Sincronizar agora` para forcar uma nova sincronizacao manual.
5. Confira a tabela `public.player_progress` no Supabase.

A estrategia atual compara `updated_at` remoto com o estado local salvo, carrega o progresso remoto mais recente no login, cria registro inicial quando necessario e faz `upsert` em `public.player_progress` apos mudancas de XP, moedas, nivel, progresso, streak, conquistas e configuracoes.

### Como testar ranking online

1. Entre na conta.
2. Sincronize o progresso.
3. Abra `Ranking`.
4. Alterne entre `Global` e `Semanal`.

Sem login ou sem Supabase configurado, a tela mostra o ranking local e nenhuma funcionalidade offline e bloqueada. O ranking online seleciona apenas campos publicos necessarios: nome exibido, avatar, XP, nivel, linguagem favorita, periodo e data de atualizacao.

### Seguranca Supabase

- `profiles`: leitura, insert e update apenas pelo dono.
- `player_progress`: leitura, insert e update apenas pelo dono.
- `leaderboard_entries`: leitura publica apenas das colunas de ranking.
- `leaderboard_entries`: insert/update apenas da propria entrada do usuario autenticado.
- O app usa somente anon key publica. Nenhuma service role key deve ir para Expo.

### Limitacoes atuais

- Sync automatico acontece apos login e tambem quando o progresso local muda.
- Conflito evita sobrescrever progresso remoto mais novo com estado local antigo usando `updated_at`.
- Ranking semanal usa a mesma pontuacao atual, pronto para evoluir com janelas reais no backend.
- Login social e exclusao de conta ainda nao foram implementados. Recuperacao de senha usa Supabase Auth quando a nuvem esta configurada.
- A anon key e publica por natureza; RLS protege as tabelas sensiveis.

## Professor Byte com IA

O Professor Byte possui uma tela de chat em `src/screens/ProfessorByteScreen.tsx` e dicas contextuais em desafios. A IA real roda pela arquitetura segura:

```txt
App Expo -> Supabase Edge Function professor-byte-ai -> OpenRouter -> App Expo
```

O app nunca chama provedores de IA diretamente e nunca recebe `OPENROUTER_API_KEY`.

Arquivos principais:

- `src/types/aiTutor.ts`: mensagens, request, response, contexto e modo
- `src/services/aiTutorService.ts`: historico local, chamada remota e fallback
- `src/services/professorByteAi.ts`: chamada segura para `supabase.functions.invoke("professor-byte-ai")`
- `src/services/aiMockService.ts`: respostas locais simuladas
- `supabase/functions/professor-byte-ai/index.ts`: valida JWT, chama OpenRouter e retorna `{ answer, mode }`
- `docs/ADR-003-AI-Tutor.md`: decisao arquitetural da IA

### Fallback local

Se o usuario estiver sem sessao, sem internet, com Supabase indisponivel ou com erro no OpenRouter, o app usa fallback local. As respostas antigas simuladas continuam como plano B e a interface mostra aviso discreto sem travar Campanha, Academia, Arena ou chat.

### IA real com OpenRouter

Configure a secret no Supabase. Nunca coloque `OPENROUTER_API_KEY` no `.env` do Expo, `app.json`, `src` ou qualquer arquivo publico do app.

```bash
npx supabase secrets set OPENROUTER_API_KEY=SUA_CHAVE_OPENROUTER
npx supabase functions deploy professor-byte-ai
```

Payload enviado para a Edge Function:

```json
{
  "mode": "hint",
  "source": "arena",
  "language": "JavaScript",
  "level": "iniciante",
  "question": "Qual alternativa corrige este bug?",
  "options": ["..."],
  "userProgress": { "level": 3, "xp": 850, "completedMissions": 12, "streak": 4 }
}
```

Resposta da função:

```json
{
  "answer": "Texto do Professor Byte",
  "mode": "hint"
}
```

### Seguranca da IA

- Nao coloque chave de IA no aplicativo.
- Guarde `OPENROUTER_API_KEY` somente nas secrets do Supabase.
- A Edge Function valida JWT do Supabase e rejeita chamadas sem autenticacao.
- Use rate limit por usuario/IP.
- Limite tamanho de prompt e resposta.
- Aplique quotas diarias para controlar custo.
- Logue erros e uso sem armazenar dados sensiveis desnecessarios.
- Valide autenticacao se a IA real for recurso premium ou exigir conta.

### Custos e limites

O mock local nao tem custo. No modo real, o custo depende do modelo, tokens de entrada/saida e volume de mensagens. Comece com limites conservadores, respostas curtas e historico reduzido.

## Proximos passos para monetizacao real

1. Definir quais campanhas/aulas/desafios entram no Premium.
2. Criar backend ou RevenueCat/StoreKit/Billing em build nativo.
3. Separar entitlements premium em um service.
4. Adicionar termos, privacidade e restaurar compras.
5. Medir funil: onboarding, primeira aula, primeira campanha, primeira compra.
6. Testar precos e pacotes com usuarios reais.

## Como adicionar personagem

1. Adicione ou atualize o personagem em `src/data/characters.ts`.
2. Inclua personalidade, descricao e frase caracteristica.
3. Registre o placeholder ou arte em `src/data/assetRegistry.ts`.
4. Crie falas em `src/data/mentorDialogues.ts`.

## Como trocar artes

1. Coloque a arte em `src/assets/characters`, `bosses`, `avatars`, `badges`, `backgrounds` ou `icons`.
2. Atualize `src/data/assetRegistry.ts`.
3. Substitua gradualmente os placeholders textuais por imagens nos componentes desejados.

## Checklist de Publicacao

- Criar icone final do app
- Criar splash screen final
- Gerar screenshots de loja
- Escrever politica de privacidade
- Escrever termos de uso
- Revisar conteudo educacional
- Testar em Android real
- Testar em iPhone real
- Validar acessibilidade e contraste
- Configurar EAS Build
- Criar build Android
- Criar build iOS
- Preparar Google Play Console
- Preparar App Store Connect
- Testar onboarding, compra futura e restaurar compras quando monetizacao real existir

Capitulos:

1. O Primeiro Codigo
2. Cidade do Front-end
3. Fortaleza Back-end
4. Academia Mobile
5. Empresa dos Devs
6. Entrevista Final

Trilhas iniciais:

- Front-end
- Back-end
- Mobile Kotlin
- Mobile React Native
- Full Stack

## Como adicionar capitulos

Adicione um item em `src/data/campaignChapters.ts`:

```ts
{
  id: 'chapter-7',
  order: 7,
  title: 'Novo Capitulo',
  description: 'Tema do capitulo.',
  icon: 'rocket',
  visualTheme: '#43d9ad',
  requiredChapterId: 'chapter-6',
  bossId: 'boss-new'
}
```

## Como adicionar missoes

Adicione itens em `src/data/campaignMissions.ts`. Cada missao precisa de capitulo, dialogos, recompensas e requisito opcional:

```ts
{
  id: 'c7-m1',
  chapterId: 'chapter-7',
  title: 'Nova missao',
  description: 'Objetivo narrativo.',
  concept: 'Conceito',
  areaId: 'typescript',
  type: 'quiz',
  beforeDialogueId: 'mission-start-default',
  afterDialogueId: 'mission-end-default',
  rewardXp: 120,
  rewardCoins: 50
}
```

## Como adicionar personagens e dialogos

Crie personagens em `src/data/characters.ts` e sequencias em `src/data/mentorDialogues.ts`. Depois referencie o `dialogueId` em missoes ou bosses.

## Como adicionar bosses

Adicione o boss em `src/data/campaignBosses.ts` e conecte seu `id` ao `bossId` do capitulo. Bosses possuem vida, ataque, fraqueza, falas e recompensas.

## Como testar a campanha

1. Rode `npx expo start`
2. Abra no Expo Go
3. Toque em `Campanha` na tela inicial
4. Veja ou pule a introducao
5. Escolha uma trilha
6. Abra capitulos, conclua missoes e enfrente bosses

## Conteudo inicial

O arquivo `src/data/questions.ts` gera 660 perguntas com IDs estaveis, dica, explicacao, dificuldade, pontuacao, tags e tipo educacional. A Arena em `src/data/codeChallenges.ts` gera 570 desafios praticos simulados.

Cobertura atual:

- Logica de programacao
- JavaScript
- TypeScript
- Python
- Java
- Kotlin
- C#
- SQL
- HTML
- CSS
- React
- Node.js
- Git
- APIs REST
- Entrevista tecnica

Minimos protegidos por auditoria:

- Front-end: pelo menos 80 perguntas somando HTML, CSS, JavaScript e React
- JavaScript: 50
- HTML: 30
- CSS: 30
- React: 40
- Back-end: pelo menos 60 somando Node.js, APIs REST, Java, Kotlin e C#
- Node.js: 40
- APIs REST: 40
- SQL: 50
- Git/GitHub: 40
- Java: 50
- Kotlin: 50
- Logica: 60
- Python: 50
- TypeScript: 40
- Entrevista tecnica: 60

## Como adicionar perguntas

Em `src/data/questions.ts`, adicione um `topic(...)` na area desejada ou crie uma nova `AreaBank`. Cada pergunta gerada precisa manter:

```ts
topic(
  'semantic-main',
  'main semantico',
  'conteudo principal unico da pagina',
  ['rodape repetido', 'script externo', 'classe visual'],
  'main ajuda navegadores e leitores a encontrar o conteudo central.',
  'Regiao principal.',
  ['semantica', 'frontend']
)
```

Padrao de ID: `prefixo-topico-001`, por exemplo `frontend-html-semantic-main-001`, `kotlin-null-safety-001` ou `sql-select-001`.

Tipos aceitos em quiz: `quiz`, `complete-code`, `bug-hunt`, `order-blocks` e `best-solution`. Toda pergunta tambem recebe `type`: `quiz`, `codigo`, `bug`, `conceito`, `saida` ou `entrevista`.

## Auditoria de conteudo

Rode:

```bash
npm run audit:content
```

O auditor valida:

- IDs duplicados em perguntas e desafios
- prompts duplicados
- 4 alternativas por pergunta/desafio
- `correctIndex` valido
- campos obrigatorios
- tags
- minimo por categoria
- distribuicao por dificuldade e tipo
- fases referenciando perguntas inexistentes
- fases do mesmo mundo usando listas excessivamente parecidas

## Selecao anti-repeticao

`src/services/questionSelectionService.ts` seleciona perguntas por fase com estas regras:

- nao repete pergunta dentro da sessao
- usa historico local em AsyncStorage (`@codequest/question-seen-history`)
- evita perguntas respondidas recentemente pelo jogador
- prioriza perguntas ainda nao vistas
- respeita a lista candidata da fase
- se faltar conteudo, permite fallback ordenando por perguntas vistas ha mais tempo

As fases em `src/data/worlds.ts` agora usam pools candidatos por identidade de fase. O mundo Front-end foi separado em HTML semantico, CSS layout, DOM/JavaScript, React/estado e Boss UI responsiva.

## Como adicionar novas linguagens

1. Adicione o identificador em `AreaId` dentro de `src/types/game.ts`.
2. Crie perguntas suficientes em `src/data/questions.ts` e rode `npm run audit:content`.
3. Adicione o nome em `areaName` dentro de `src/data/worlds.ts`.
4. Inclua a area em um mundo existente ou crie um novo `World`.
5. Crie uma `Stage` apontando para as perguntas da area.

## Monetizacao futura

A loja (`src/data/shop.ts`) ja separa itens por categoria: avatar, tema, boost e premium. Mundos e fases tambem aceitam `premium: true`, permitindo evoluir para:

- Versao gratuita com mundos limitados
- Pacotes de moedas
- Temas e avatares pagos
- Passe profissional
- Remocao de anuncios
- Desafios premium de carreira

Pagamentos nao foram implementados neste MVP para manter compatibilidade simples com Expo Go.

## Proximos passos para publicar

1. Criar identidade visual final, icone e splash.
2. Rodar testes em Android, iOS e web com `npx expo start`.
3. Configurar EAS Build: `npx expo install eas-cli` e `eas build:configure`.
4. Criar builds: `eas build --platform android` e `eas build --platform ios`.
5. Preparar politicas de privacidade, screenshots, descricao e classificacao indicativa.
6. Publicar na Google Play Console, App Store Connect e web via Expo export/hosting.

## Validacao

```bash
npm run lint
npm run typecheck
npx expo install --fix
npx expo-doctor
```

## Qualidade e Manutencao

O projeto usa uma arquitetura por dominio:

- `data/`: conteudo versionado do jogo
- `services/`: persistencia, progresso, som, analytics e regras de armazenamento
- `types/`: contratos TypeScript compartilhados
- `components/`: componentes de produto e componentes especificos de jogo
- `components/ui/`: design system reutilizavel
- `screens/`: composicao de fluxos e telas
- `theme/`: tokens visuais

Boas praticas aplicadas:

- Parse seguro de AsyncStorage com fallback para nao quebrar saves antigos
- Listas grandes da Academia e Arena usando `FlatList`
- Scripts oficiais de lint e typecheck
- Tipos reutilizaveis para icones e UI
- Design system centralizado
- Registro central de assets temporarios
- Services sem dependencias de UI

## Aliases

Aliases TypeScript configurados:

- `@components`
- `@screens`
- `@services`
- `@hooks`
- `@theme`
- `@types`
- `@utils`
- `@data`

Use aliases em arquivos de composicao ou quando o import relativo ficar longo. Dentro de arquivos muito proximos, imports relativos continuam aceitaveis.

## Convenções Obrigatórias

- Services nao importam componentes nem telas.
- Chaves de AsyncStorage ficam em `src/services/storageKeys.ts`.
- Todo parse de storage deve usar fallback seguro.
- Dados versionados ficam em `src/data`.
- Contratos compartilhados ficam em `src/types`.
- Componentes visuais novos devem usar tokens de `src/theme`.
- Listas grandes ou expansivas devem usar `FlatList`.
- Nao adicionar dependencias sem verificar compatibilidade com Expo SDK 54.
- Antes de finalizar mudancas, rodar lint, typecheck e Expo Doctor.

## Como Criar Um Novo Modulo

1. Defina tipos em `src/types`.
2. Coloque conteudo inicial em `src/data`, se existir.
3. Crie service em `src/services` para persistencia ou regras.
4. Crie hook em `src/hooks` para leitura/mutacao do service.
5. Crie componentes em `src/components`.
6. Crie tela em `src/screens`.
7. Registre rota em `src/navigation/routes.ts`.
8. Conecte a tela em `src/navigation/AppNavigator.tsx`.
9. Atualize README ou ADR se houver decisao arquitetural.

## ADRs

Decisoes arquiteturais ficam em `docs/`.

- `docs/ADR-001-Architecture.md`
- `docs/ADR-002-Supabase.md`
- `docs/ADR-003-AI-Tutor.md`

Antes de abrir PR ou publicar uma build, rode:

```bash
npm run lint
npm run typecheck
npx expo install --fix
npx expo-doctor
npx expo start --localhost
```
