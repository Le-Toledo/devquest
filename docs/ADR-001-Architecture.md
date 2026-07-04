# ADR-001: Arquitetura do CodeQuest Academy

## Status

Aceito.

## Contexto

CodeQuest Academy e um app educacional em Expo SDK 54, React Native e TypeScript. O produto cresceu para incluir campanha RPG, quizzes, Academia Dev, Arena de Codigo, Laboratorio de Revisao, loja, ranking, premium simulado, streak e analytics local.

O objetivo arquitetural e permitir crescimento por anos sem transformar telas em arquivos gigantes nem misturar UI, persistencia e conteudo.

## Decisoes

### 1. Expo SDK 54 e Expo Go

O projeto permanece em Expo SDK 54 e deve continuar compativel com Expo Go. Dependencias nativas novas so devem ser adicionadas quando forem essenciais e compativeis com o SDK atual.

### 2. Navegacao tipada leve

O entrypoint usa `expo-router/entry`, mas a navegacao interna do MVP permanece em `src/navigation/AppNavigator.tsx` com a union `AppRoute`.

Motivo:

- O app ainda nao precisa de stack/tab complexa.
- A union tipada evita rotas invalidas.
- A migracao futura para arquivos Expo Router pode ser feita de forma incremental.

### 3. Separacao por camadas

- `screens/`: composicao de telas e fluxos.
- `components/`: componentes reutilizaveis de produto e jogo.
- `components/ui/`: design system base.
- `services/`: persistencia e regras sem dependencia de UI.
- `hooks/`: adaptadores de estado entre services e telas.
- `data/`: conteudo versionado do jogo.
- `types/`: contratos compartilhados.
- `theme/`: tokens visuais.
- `utils/`: funcoes puras.

### 4. Persistencia local centralizada

Todas as chaves de AsyncStorage devem morar em `src/services/storageKeys.ts`.

Services devem:

- usar `parseJsonOrFallback` ou `parseArrayOrFallback`;
- preservar compatibilidade com saves antigos;
- nao importar componentes ou telas.

### 5. Hooks por dominio

Dominios com progresso local possuem hooks:

- `useAcademy`
- `useArena`
- `useCampaign`
- `useReview`
- `usePlayer`
- `useSettings`

Telas devem preferir hooks em vez de chamar services diretamente para carregamento inicial.

### 6. Aliases e barrels

Aliases configurados em `tsconfig.json`:

- `@components`
- `@screens`
- `@services`
- `@hooks`
- `@theme`
- `@types`
- `@utils`
- `@data`

Barrels existem para reduzir imports ruidosos em pontos de composicao. Imports relativos continuam aceitaveis dentro do mesmo modulo quando forem mais claros.

### 7. Design system

Novos componentes visuais devem usar tokens de `src/theme/` e, quando possivel, os componentes de `src/components/ui/`.

Componentes legados (`GameButton`, `GameCard`, `GradientScreen`) continuam suportados porque muitas telas usam esses contratos.

### 8. Performance

Listas com crescimento esperado devem usar `FlatList`. `ScrollView` e aceitavel para telas pequenas, estaticas ou com poucos cards.

Memoizacao deve ser usada apenas quando reduz renderizacao real ou estabiliza callbacks passados para listas.

## Consequencias

Beneficios:

- Menos acoplamento entre telas e persistencia.
- Saves locais mais resilientes.
- Imports mais claros em composicoes grandes.
- Base preparada para migracao gradual de navegacao e backend.

Trade-offs:

- A navegacao ainda nao usa todo o potencial de arquivos do Expo Router.
- Algumas telas grandes ainda devem ser quebradas em subcomponentes em uma fase futura.
- Barrels exigem disciplina para evitar ciclos de importacao.

## Regras Para Novos Modulos

1. Criar tipos em `src/types`.
2. Criar dados em `src/data` se o conteudo for versionado.
3. Criar service em `src/services` se houver persistencia/regra.
4. Criar hook em `src/hooks` se uma tela carregar ou mutar estado do service.
5. Criar componentes reutilizaveis em `src/components` ou `src/components/ui`.
6. Conectar a rota em `src/navigation/routes.ts` e `AppNavigator.tsx`.
7. Rodar `npm run lint`, `npm run typecheck` e `npx expo-doctor`.
