# ADR-003: Professor Byte AI Tutor

## Status

Accepted

## Context

O Professor Byte precisa evoluir para um tutor inteligente sem expor chaves de IA no aplicativo mobile. Apps Expo distribuem variaveis publicas no bundle, portanto qualquer segredo colocado no cliente pode ser extraido.

## Decision

- O app nunca chama provedores de IA diretamente com API key.
- O app chama apenas um endpoint HTTPS configurado em `EXPO_PUBLIC_AI_TUTOR_ENDPOINT`.
- O endpoint serverless e responsavel por guardar a chave de IA em variavel secreta do servidor.
- Se o endpoint nao existir, nao for HTTPS, falhar ou retornar payload invalido, o app usa `aiMockService`.
- O historico do chat fica local em AsyncStorage para manter funcionamento offline.
- O prompt e montado por `promptBuilder.ts` com contexto educacional, historico curto e instrucoes do Professor Byte.

## Endpoint Esperado

Request:

```json
{
  "message": "Explique meu erro",
  "prompt": "Prompt completo montado pelo app",
  "history": [],
  "context": {
    "source": "review",
    "language": "kotlin",
    "concept": "null safety"
  }
}
```

Response:

```json
{
  "answer": "Resposta didatica do Professor Byte"
}
```

## Security

- Nunca colocar OpenAI, Anthropic, Gemini ou outra API key no app.
- Validar autenticacao quando quiser limitar IA a usuarios logados.
- Aplicar rate limit por usuario, IP e dispositivo.
- Definir teto de tokens e tamanho maximo de entrada.
- Registrar metricas de uso sem salvar segredos nem dados sensiveis desnecessarios.
- Bloquear abuso com captcha, quotas, allowlist de origem quando aplicavel e logs de anomalia.

## Consequences

O Professor Byte funciona imediatamente em modo mock e pode receber IA real depois sem mudar o app. A qualidade do modo remoto depende do endpoint serverless, do modelo escolhido e dos limites de custo configurados no backend.
