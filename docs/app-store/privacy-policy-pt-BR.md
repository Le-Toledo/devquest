# Política de Privacidade - Code Quest

> Publicação obrigatória antes da submissão: [URL_PUBLICA_OBRIGATORIA_DA_POLITICA]

Esta política descreve o comportamento atual do Code Quest.

## Dados de conta

Quando o usuário cria uma conta, o app usa Supabase Auth. Podem ser tratados e-mail, identificador de usuário e dados necessários para autenticação.

## Progresso e jogo

O app salva progresso localmente e pode sincronizar com Supabase: XP, moedas, nível, campanha, aulas, Arena, Code Lab, revisão, conquistas, configurações e sequência de estudo.

## Ranking

Quando a sincronização online está ativa, o ranking pode exibir nome/apelido, avatar, XP, nível e linguagem favorita.

## Professor Byte

Quando a IA real está configurada e o usuário está autenticado, o app envia ao serviço de IA somente o contexto necessário da pergunta, aula, erro ou desafio. O app sanitiza e limita contexto, mas o usuário não deve enviar senhas, tokens, chaves ou dados pessoais.

## Feedback

Nesta etapa, a Central de Feedback salva relatos localmente no aparelho. O envio online ainda não está ativo. O feedback local inclui categoria, mensagem sanitizada, área opcional, versão do app, plataforma e data.

## Analytics

O app mantém analytics locais de estudo, como tempo estimado, aulas feitas, desafios feitos e erros revisados. Não há SDK de anúncios ou tracking nesta versão.

## Armazenamento local

O app usa AsyncStorage para sessão, progresso, configurações, rascunhos e feedback local.

## Terceiros

- Supabase: autenticação, sessão e sincronização.
- OpenRouter via Supabase Edge Function: respostas do Professor Byte quando ativado.
- Expo/React Native: infraestrutura do aplicativo.

## Retenção e exclusão

O usuário pode sair da conta e resetar progresso local. A exclusão real da conta precisa da Edge Function autenticada implantada e validada. Antes da submissão, esse fluxo deve estar funcional.

## Contato

Contato público obrigatório antes da submissão: [CONTATO_PUBLICO_OBRIGATORIO]
