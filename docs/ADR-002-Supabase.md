# ADR-002: Supabase Local-First Backend

## Status

Accepted

## Context

Code Quest nasceu como app offline com AsyncStorage. A evolucao para produto conectado precisa adicionar autenticacao, sincronizacao e ranking online sem quebrar saves locais, sem exigir build nativo e sem expor segredos no cliente Expo.

## Decision

- Usar Supabase com `@supabase/supabase-js` e `react-native-url-polyfill`, mantendo compatibilidade com Expo Go.
- Configurar apenas `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no app.
- Manter AsyncStorage como fonte local e fallback offline.
- Sincronizar automaticamente apos login e sempre que o progresso local relevante mudar, mantendo fallback local quando a nuvem falhar.
- Resolver conflito comparando `updated_at` remoto com o estado local salvo para evitar sobrescrever progresso mais novo.
- Salvar progresso completo em `player_progress.progress` como `jsonb`, junto de XP, moedas, nivel, streak, conquistas e configuracoes.
- Publicar ranking com dados minimos: nome exibido, avatar, XP, nivel, linguagem favorita, periodo e data de atualizacao.
- Proteger `profiles` e `player_progress` com RLS por dono.
- Permitir leitura publica do ranking, mas restringir permissao de SELECT as colunas publicas.

## Consequences

O app continua funcionando sem Supabase configurado. A anon key e publica por natureza, e a seguranca dos dados privados depende de RLS e das permissoes SQL. A estrategia de conflito e suficiente para MVP, mas nao substitui um merge granular quando houver multiplos dispositivos ativos.

## Follow-ups

- Adicionar recuperacao de senha.
- Criar exclusao de conta e exportacao de dados.
- Evoluir sync automatico em background com fila offline para multiplos dispositivos ativos.
- Criar ranking semanal real com janelas por data no backend.
- Substituir `jsonb` amplo por tabelas normalizadas se analytics, IA ou multiplayer precisarem de consultas detalhadas.
