# ADR-003: Professor Byte AI Tutor

## Status

Accepted

## Context

O Professor Byte precisa evoluir para um tutor inteligente sem expor chaves de IA no aplicativo mobile. Apps Expo distribuem variaveis publicas no bundle, portanto qualquer segredo colocado no cliente pode ser extraido.

## Decision

- O app nunca chama provedores de IA diretamente com API key.
- O app chama apenas a Supabase Edge Function `professor-byte-ai` com sessao autenticada.
- A Edge Function e responsavel por guardar `OPENROUTER_API_KEY` em secret do Supabase.
- Se a funcao, a sessao, a rede ou o provedor de IA falhar, o app usa `aiMockService`.
- O historico do chat fica local em AsyncStorage para manter funcionamento offline.
- O prompt final e montado na Edge Function com contexto educacional e instrucoes do Professor Byte.

## Edge Function

Request:

```json
{
  "mode": "hint",
  "source": "arena",
  "language": "JavaScript",
  "level": "iniciante",
  "question": "Qual alternativa corrige este bug?",
  "options": ["..."]
}
```

Response:

```json
{
  "answer": "Resposta didatica do Professor Byte",
  "mode": "hint"
}
```

## Security

- Nunca colocar OpenRouter, OpenAI, Anthropic, Gemini ou outra API key no app.
- Validar autenticacao Supabase antes de chamar o provedor de IA.
- Aplicar rate limit por usuario, IP e dispositivo.
- Definir teto de tokens e tamanho maximo de entrada.
- Registrar metricas de uso sem salvar segredos nem dados sensiveis desnecessarios.
- Bloquear abuso com captcha, quotas, allowlist de origem quando aplicavel e logs de anomalia.

## Consequences

O Professor Byte funciona com fallback local e pode usar IA real sem expor secrets no app. A qualidade do modo remoto depende da Edge Function, do modelo escolhido no OpenRouter e dos limites de custo configurados no provedor.
